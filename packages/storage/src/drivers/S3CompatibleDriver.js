import crypto from "node:crypto";
import { Readable } from "node:stream";
import IStorageDriver from "../contracts/IStorageDriver.js";
import IMultipartUploadProvider from "../contracts/IMultipartUploadProvider.js";
import StoragePath from "../core/StoragePath.js";
import FileMetadata from "../core/FileMetadata.js";
import S3SignerV4 from "../internal/S3SignerV4.js";
import {
  FileNotFoundException,
  UnableToWriteException,
  UnableToReadException,
  UnableToDeleteException
} from "../exceptions/StorageException.js";

export class S3CompatibleDriver extends IStorageDriver {
  constructor(options = {}) {
    super();
    this.bucket = options.bucket || "ecf-bucket";
    this.endpoint = options.endpoint || "https://s3.amazonaws.com";
    this.signer = new S3SignerV4(options);
    this.publicUrlBase = options.publicUrlBase || `${this.endpoint}/${this.bucket}`;
  }

  name() {
    return "s3";
  }

  supports(capability) {
    return ["streams", "checksum", "visibility", "metadata", "temporaryUrl", "multipart"].includes(capability);
  }

  capabilities() {
    return ["streams", "checksum", "visibility", "metadata", "temporaryUrl", "multipart"];
  }

  getUrl(pathStr) {
    const key = StoragePath.normalize(pathStr);
    return `${this.endpoint.replace(/\/+$/, "")}/${this.bucket}/${key}`;
  }

  async put(pathStr, contents, options = {}) {
    const key = StoragePath.normalize(pathStr);
    const url = this.getUrl(key);
    const buffer = Buffer.isBuffer(contents) ? contents : Buffer.from(String(contents));
    const payloadHash = crypto.createHash("sha256").update(buffer).digest("hex");

    const rawHeaders = {
      "content-type": options.mime || "application/octet-stream",
      "x-amz-acl": options.visibility === "public" ? "public-read" : "private"
    };

    const headers = this.signer.signHeaders("PUT", url, rawHeaders, payloadHash);

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers,
        body: buffer
      });

      if (!response.ok) {
        throw new Error(`S3 Error HTTP ${response.status}: ${await response.text()}`);
      }
      return true;
    } catch (err) {
      throw new UnableToWriteException(key, err.message);
    }
  }

  async get(pathStr) {
    const key = StoragePath.normalize(pathStr);
    const url = this.getUrl(key);
    const headers = this.signer.signHeaders("GET", url, {}, "UNSIGNED-PAYLOAD");

    try {
      const response = await fetch(url, { method: "GET", headers });
      if (response.status === 404) {
        throw new FileNotFoundException(key, "s3");
      }
      if (!response.ok) {
        throw new Error(`S3 HTTP ${response.status}`);
      }
      return await response.text();
    } catch (err) {
      if (err instanceof FileNotFoundException) throw err;
      throw new UnableToReadException(key, err.message);
    }
  }

  async exists(pathStr) {
    try {
      const key = StoragePath.normalize(pathStr);
      const url = this.getUrl(key);
      const headers = this.signer.signHeaders("HEAD", url, {}, "UNSIGNED-PAYLOAD");
      const res = await fetch(url, { method: "HEAD", headers });
      return res.ok;
    } catch {
      return false;
    }
  }

  async delete(pathStr) {
    const key = StoragePath.normalize(pathStr);
    const url = this.getUrl(key);
    const headers = this.signer.signHeaders("DELETE", url, {}, "UNSIGNED-PAYLOAD");

    try {
      const res = await fetch(url, { method: "DELETE", headers });
      return res.ok || res.status === 404;
    } catch (err) {
      throw new UnableToDeleteException(key, err.message);
    }
  }

  async copy(source, destination) {
    const srcKey = StoragePath.normalize(source);
    const destKey = StoragePath.normalize(destination);
    const url = this.getUrl(destKey);

    const rawHeaders = {
      "x-amz-copy-source": `/${this.bucket}/${srcKey}`
    };

    const headers = this.signer.signHeaders("PUT", url, rawHeaders, "UNSIGNED-PAYLOAD");

    try {
      const res = await fetch(url, { method: "PUT", headers });
      if (!res.ok) throw new Error(`Copy failed: HTTP ${res.status}`);
      return true;
    } catch (err) {
      throw new UnableToWriteException(destKey, err.message);
    }
  }

  async move(source, destination) {
    await this.copy(source, destination);
    await this.delete(source);
    return true;
  }

  async readStream(pathStr) {
    const key = StoragePath.normalize(pathStr);
    const url = this.getUrl(key);
    const headers = this.signer.signHeaders("GET", url, {}, "UNSIGNED-PAYLOAD");

    const res = await fetch(url, { method: "GET", headers });
    if (res.status === 404) throw new FileNotFoundException(key, "s3");
    if (!res.ok || !res.body) throw new UnableToReadException(key, `HTTP ${res.status}`);

    return Readable.fromWeb(res.body);
  }

  async writeStream(pathStr, stream, options = {}) {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const combined = Buffer.concat(chunks);
    return this.put(pathStr, combined, options);
  }

  async temporaryUrl(pathStr, expirationSeconds = 3600) {
    const key = StoragePath.normalize(pathStr);
    const url = this.getUrl(key);
    return this.signer.presignUrl("GET", url, expirationSeconds);
  }

  async metadata(pathStr) {
    const key = StoragePath.normalize(pathStr);
    const url = this.getUrl(key);
    const headers = this.signer.signHeaders("HEAD", url, {}, "UNSIGNED-PAYLOAD");

    try {
      const res = await fetch(url, { method: "HEAD", headers });
      if (res.status === 404) throw new FileNotFoundException(key, "s3");
      if (!res.ok) throw new UnableToReadException(key, `HTTP ${res.status}`);

      return new FileMetadata({
        path: key,
        disk: "s3",
        size: parseInt(res.headers.get("content-length") || "0", 10),
        mimeType: res.headers.get("content-type") || "application/octet-stream",
        etag: res.headers.get("etag") || null,
        lastModified: res.headers.get("last-modified") ? new Date(res.headers.get("last-modified")) : new Date(),
        visibility: res.headers.get("x-amz-acl") === "public-read" ? "public" : "private"
      });
    } catch (err) {
      if (err instanceof FileNotFoundException) throw err;
      throw new UnableToReadException(key, err.message);
    }
  }

  async checksum(pathStr, algo = "sha256") {
    const meta = await this.metadata(pathStr);
    if (meta.etag) return meta.etag.replace(/"/g, "");

    const contents = await this.get(pathStr);
    return crypto.createHash(algo).update(contents).digest("hex");
  }
}

export default S3CompatibleDriver;
