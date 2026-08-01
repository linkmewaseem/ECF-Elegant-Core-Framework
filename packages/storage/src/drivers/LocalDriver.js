import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import IStorageDriver from "../contracts/IStorageDriver.js";
import StoragePath from "../core/StoragePath.js";
import FileMetadata from "../core/FileMetadata.js";
import {
  FileNotFoundException,
  UnableToWriteException,
  UnableToReadException,
  UnableToDeleteException
} from "../exceptions/StorageException.js";

export class LocalDriver extends IStorageDriver {
  constructor(options = {}) {
    super();
    this.root = path.resolve(options.root || "./storage/app");
    this.key = options.key || "ecf-local-signer-secret";
    this.publicUrlBase = options.publicUrlBase || "/storage";
    this.permissions = {
      file: {
        public: 0o644,
        private: 0o600,
        ...options.permissions?.file
      },
      dir: {
        public: 0o755,
        private: 0o700,
        ...options.permissions?.dir
      }
    };
  }

  name() {
    return "local";
  }

  supports(capability) {
    return ["streams", "checksum", "visibility", "metadata", "directories", "temporaryUrl"].includes(capability);
  }

  capabilities() {
    return ["streams", "checksum", "visibility", "metadata", "directories", "temporaryUrl"];
  }

  getAbsPath(relativePath) {
    const key = StoragePath.normalize(relativePath);
    return path.join(this.root, key);
  }

  async put(pathStr, contents, options = {}) {
    const absPath = this.getAbsPath(pathStr);
    const dir = path.dirname(absPath);
    const visibility = options.visibility || "private";
    const dirPerm = this.permissions.dir[visibility] || 0o700;
    const filePerm = this.permissions.file[visibility] || 0o600;

    await fs.promises.mkdir(dir, { recursive: true, mode: dirPerm });

    // Atomic Write Pattern: write to temp file -> fsync -> rename
    const tmpPath = `${absPath}.tmp.${crypto.randomBytes(8).toString("hex")}`;

    try {
      const handle = await fs.promises.open(tmpPath, "w", filePerm);
      const buffer = Buffer.isBuffer(contents) ? contents : Buffer.from(String(contents));
      await handle.write(buffer, 0, buffer.length, 0);
      await handle.sync(); // fsync to flush bytes to disk
      await handle.close();

      await fs.promises.chmod(tmpPath, filePerm);
      await fs.promises.rename(tmpPath, absPath);
      return true;
    } catch (err) {
      if (fs.existsSync(tmpPath)) {
        await fs.promises.unlink(tmpPath).catch(() => {});
      }
      throw new UnableToWriteException(pathStr, err.message);
    }
  }

  async get(pathStr) {
    const absPath = this.getAbsPath(pathStr);
    try {
      return await fs.promises.readFile(absPath, "utf8");
    } catch (err) {
      if (err.code === "ENOENT") {
        throw new FileNotFoundException(pathStr, "local");
      }
      throw new UnableToReadException(pathStr, err.message);
    }
  }

  async getBuffer(pathStr) {
    const absPath = this.getAbsPath(pathStr);
    try {
      return await fs.promises.readFile(absPath);
    } catch (err) {
      if (err.code === "ENOENT") {
        throw new FileNotFoundException(pathStr, "local");
      }
      throw new UnableToReadException(pathStr, err.message);
    }
  }

  async exists(pathStr) {
    try {
      const absPath = this.getAbsPath(pathStr);
      await fs.promises.access(absPath);
      return true;
    } catch {
      return false;
    }
  }

  async delete(pathStr) {
    const absPath = this.getAbsPath(pathStr);
    try {
      await fs.promises.unlink(absPath);
      return true;
    } catch (err) {
      if (err.code === "ENOENT") return false;
      throw new UnableToDeleteException(pathStr, err.message);
    }
  }

  async copy(source, destination) {
    const srcAbs = this.getAbsPath(source);
    const destAbs = this.getAbsPath(destination);
    try {
      const dir = path.dirname(destAbs);
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.copyFile(srcAbs, destAbs);
      return true;
    } catch (err) {
      if (err.code === "ENOENT") throw new FileNotFoundException(source, "local");
      throw new UnableToWriteException(destination, err.message);
    }
  }

  async move(source, destination) {
    const srcAbs = this.getAbsPath(source);
    const destAbs = this.getAbsPath(destination);
    try {
      const dir = path.dirname(destAbs);
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.rename(srcAbs, destAbs);
      return true;
    } catch (err) {
      if (err.code === "ENOENT") throw new FileNotFoundException(source, "local");
      throw new UnableToWriteException(destination, err.message);
    }
  }

  async readStream(pathStr) {
    const absPath = this.getAbsPath(pathStr);
    if (!fs.existsSync(absPath)) {
      throw new FileNotFoundException(pathStr, "local");
    }
    return fs.createReadStream(absPath);
  }

  async writeStream(pathStr, stream, options = {}) {
    const absPath = this.getAbsPath(pathStr);
    const dir = path.dirname(absPath);
    await fs.promises.mkdir(dir, { recursive: true });

    const tmpPath = `${absPath}.tmp.${crypto.randomBytes(8).toString("hex")}`;
    const writeStream = fs.createWriteStream(tmpPath);

    try {
      await pipeline(stream, writeStream);
      await fs.promises.rename(tmpPath, absPath);
      return true;
    } catch (err) {
      if (fs.existsSync(tmpPath)) {
        await fs.promises.unlink(tmpPath).catch(() => {});
      }
      throw new UnableToWriteException(pathStr, err.message);
    }
  }

  async metadata(pathStr) {
    const absPath = this.getAbsPath(pathStr);
    try {
      const stat = await fs.promises.stat(absPath);
      const isPublic = (stat.mode & 0o044) === 0o044;
      return new FileMetadata({
        path: StoragePath.normalize(pathStr),
        disk: "local",
        size: stat.size,
        visibility: isPublic ? "public" : "private",
        lastModified: stat.mtime,
        isFile: stat.isFile(),
        isDirectory: stat.isDirectory()
      });
    } catch (err) {
      if (err.code === "ENOENT") throw new FileNotFoundException(pathStr, "local");
      throw new UnableToReadException(pathStr, err.message);
    }
  }

  async checksum(pathStr, algo = "sha256") {
    const absPath = this.getAbsPath(pathStr);
    if (!fs.existsSync(absPath)) throw new FileNotFoundException(pathStr, "local");

    const hash = crypto.createHash(algo);
    const stream = fs.createReadStream(absPath);
    return new Promise((resolve, reject) => {
      stream.on("data", chunk => hash.update(chunk));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", reject);
    });
  }

  async temporaryUrl(pathStr, expirationInSeconds = 3600) {
    const key = StoragePath.normalize(pathStr);
    const expiresAt = Math.floor(Date.now() / 1000) + expirationInSeconds;
    const signature = crypto.createHmac("sha256", this.key).update(`${key}:${expiresAt}`).digest("hex");
    return `${this.publicUrlBase}/${key}?expires=${expiresAt}&signature=${signature}`;
  }

  async makeDirectory(pathStr) {
    const absPath = this.getAbsPath(pathStr);
    await fs.promises.mkdir(absPath, { recursive: true });
    return true;
  }

  async deleteDirectory(pathStr) {
    const absPath = this.getAbsPath(pathStr);
    if (fs.existsSync(absPath)) {
      await fs.promises.rm(absPath, { recursive: true, force: true });
    }
    return true;
  }

  async files(directory = "") {
    const absDir = directory ? this.getAbsPath(directory) : this.root;
    if (!fs.existsSync(absDir)) return [];

    const entries = await fs.promises.readdir(absDir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      if (entry.isFile()) {
        const rel = directory ? `${StoragePath.normalize(directory)}/${entry.name}` : entry.name;
        files.push(rel);
      }
    }
    return files;
  }

  async allFiles(directory = "") {
    const absDir = directory ? this.getAbsPath(directory) : this.root;
    if (!fs.existsSync(absDir)) return [];

    const files = [];
    const walk = async (currentDir, prefix) => {
      const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          await walk(path.join(currentDir, entry.name), rel);
        } else if (entry.isFile()) {
          files.push(rel);
        }
      }
    };
    await walk(absDir, directory ? StoragePath.normalize(directory) : "");
    return files;
  }
}

export default LocalDriver;
