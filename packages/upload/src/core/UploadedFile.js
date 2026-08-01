import crypto from "node:crypto";
import path from "node:path";
import MagicByteSniffer from "./MagicByteSniffer.js";
import ImageDimensionParser from "./ImageDimensionParser.js";
import UploadPathSanitizer from "./UploadPathSanitizer.js";

export class UploadedFile {
  constructor(options = {}) {
    this.originalName = options.originalName || "file.bin";
    this.name = UploadPathSanitizer.sanitize(options.name || this.originalName);
    this.mimeType = options.mimeType || "application/octet-stream";
    this.buffer = Buffer.isBuffer(options.buffer) ? options.buffer : Buffer.from(options.contents || "");
    this.size = options.size ?? this.buffer.length;
    this.detectedMimeType = MagicByteSniffer.sniff(this.buffer);
    this.extension = path.extname(this.name).toLowerCase().replace(".", "");
    this._storageManager = options.storageManager || null;
  }

  hash(algo = "sha256") {
    return crypto.createHash(algo).update(this.buffer).digest("hex");
  }

  dimensions() {
    return ImageDimensionParser.parse(this.buffer);
  }

  isValid() {
    return this.size > 0;
  }

  setStorageManager(manager) {
    this._storageManager = manager;
  }

  async store(targetPath = "", disk = "local") {
    return this.storeAs(targetPath, this.name, disk);
  }

  async storeAs(targetPath = "", name = this.name, disk = "local", options = {}) {
    if (!this._storageManager) {
      throw new Error("StorageManager is not set on UploadedFile. Use setStorageManager() or container.");
    }
    const cleanName = UploadPathSanitizer.sanitize(name);
    const destination = targetPath ? `${targetPath}/${cleanName}`.replace(/\/+/g, "/") : cleanName;

    const filesystem = this._storageManager.disk(disk);
    await filesystem.put(destination, this.buffer, options);

    return {
      path: destination,
      disk,
      name: cleanName,
      size: this.size,
      mimeType: this.detectedMimeType !== "application/octet-stream" ? this.detectedMimeType : this.mimeType,
      hash: this.hash("sha256")
    };
  }

  async storePublicly(targetPath = "", disk = "local") {
    return this.storeAs(targetPath, this.name, disk, { visibility: "public" });
  }

  static fake(fileName = "avatar.jpg", options = {}) {
    const size = options.size || 1024;
    let buffer;

    if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
      // Valid JPEG header
      const header = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00]);
      buffer = Buffer.concat([header, Buffer.alloc(Math.max(0, size - header.length))]);
    } else if (fileName.endsWith(".png")) {
      // Valid PNG header + IHDR
      const header = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0x64
      ]);
      buffer = Buffer.concat([header, Buffer.alloc(Math.max(0, size - header.length))]);
    } else {
      buffer = Buffer.alloc(size, "a");
    }

    return new UploadedFile({
      originalName: fileName,
      name: fileName,
      mimeType: options.mime || "image/jpeg",
      buffer,
      storageManager: options.storageManager
    });
  }
}

export default UploadedFile;
