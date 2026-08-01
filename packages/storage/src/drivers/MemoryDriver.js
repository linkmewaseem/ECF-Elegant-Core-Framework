import { Readable } from "node:stream";
import crypto from "node:crypto";
import IStorageDriver from "../contracts/IStorageDriver.js";
import IStreamableDriver from "../contracts/IStreamableDriver.js";
import IMetadataProvider from "../contracts/IMetadataProvider.js";
import IChecksumProvider from "../contracts/IChecksumProvider.js";
import ICapabilityProvider from "../contracts/ICapabilityProvider.js";
import StoragePath from "../core/StoragePath.js";
import FileMetadata from "../core/FileMetadata.js";
import { FileNotFoundException } from "../exceptions/StorageException.js";

export class MemoryDriver extends IStorageDriver {
  constructor() {
    super();
    this.storage = new Map(); // path -> { content: Buffer, visibility: string, lastModified: Date }
  }

  name() {
    return "memory";
  }

  supports(capability) {
    return ["streams", "checksum", "visibility", "metadata", "directories"].includes(capability);
  }

  capabilities() {
    return ["streams", "checksum", "visibility", "metadata", "directories"];
  }

  async put(path, contents, options = {}) {
    const key = StoragePath.normalize(path);
    const buffer = Buffer.isBuffer(contents) ? contents : Buffer.from(String(contents));
    this.storage.set(key, {
      content: buffer,
      visibility: options.visibility || "private",
      lastModified: new Date()
    });
    return true;
  }

  async get(path) {
    const key = StoragePath.normalize(path);
    const file = this.storage.get(key);
    if (!file) {
      throw new FileNotFoundException(path, "memory");
    }
    return file.content.toString("utf8");
  }

  async getBuffer(path) {
    const key = StoragePath.normalize(path);
    const file = this.storage.get(key);
    if (!file) {
      throw new FileNotFoundException(path, "memory");
    }
    return file.content;
  }

  async exists(path) {
    try {
      const key = StoragePath.normalize(path);
      return this.storage.has(key);
    } catch {
      return false;
    }
  }

  async delete(path) {
    const key = StoragePath.normalize(path);
    return this.storage.delete(key);
  }

  async copy(source, destination) {
    const srcKey = StoragePath.normalize(source);
    const destKey = StoragePath.normalize(destination);
    const file = this.storage.get(srcKey);
    if (!file) {
      throw new FileNotFoundException(source, "memory");
    }
    this.storage.set(destKey, {
      content: Buffer.from(file.content),
      visibility: file.visibility,
      lastModified: new Date()
    });
    return true;
  }

  async move(source, destination) {
    await this.copy(source, destination);
    await this.delete(source);
    return true;
  }

  async readStream(path) {
    const buffer = await this.getBuffer(path);
    return Readable.from(buffer);
  }

  async writeStream(path, stream, options = {}) {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const combined = Buffer.concat(chunks);
    return this.put(path, combined, options);
  }

  async metadata(path) {
    const key = StoragePath.normalize(path);
    const file = this.storage.get(key);
    if (!file) {
      throw new FileNotFoundException(path, "memory");
    }
    return new FileMetadata({
      path: key,
      disk: "memory",
      size: file.content.length,
      visibility: file.visibility,
      lastModified: file.lastModified,
      isFile: true,
      isDirectory: false
    });
  }

  async checksum(path, algo = "sha256") {
    const buffer = await this.getBuffer(path);
    return crypto.createHash(algo).update(buffer).digest("hex");
  }

  async visibility(path) {
    const meta = await this.metadata(path);
    return meta.visibility;
  }

  async setVisibility(path, visibility) {
    const key = StoragePath.normalize(path);
    const file = this.storage.get(key);
    if (!file) {
      throw new FileNotFoundException(path, "memory");
    }
    file.visibility = visibility;
    return true;
  }

  async files(directory = "") {
    const prefix = directory ? StoragePath.normalize(directory) + "/" : "";
    const result = [];
    for (const key of this.storage.keys()) {
      if (!prefix || key.startsWith(prefix)) {
        const relative = key.slice(prefix.length);
        if (!relative.includes("/")) {
          result.push(key);
        }
      }
    }
    return result;
  }

  async allFiles(directory = "") {
    const prefix = directory ? StoragePath.normalize(directory) + "/" : "";
    const result = [];
    for (const key of this.storage.keys()) {
      if (!prefix || key.startsWith(prefix)) {
        result.push(key);
      }
    }
    return result;
  }
}

export default MemoryDriver;
