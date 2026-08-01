export class Attachment {
  constructor(options = {}) {
    this.name = options.name || "attachment.bin";
    this.buffer = options.buffer || null;
    this.path = options.path || null;
    this.stream = options.stream || null;
    this.mime = options.mime || "application/octet-stream";
  }

  static fromPath(filePath, name = null, mime = null) {
    return new Attachment({ path: filePath, name: name || filePath.split("/").pop(), mime });
  }

  static fromBuffer(buffer, name = "file.bin", mime = "application/octet-stream") {
    return new Attachment({ buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer), name, mime });
  }

  static async fromStorage(storageManager, pathOnDisk, disk = "local", name = null) {
    const filesystem = storageManager.disk(disk);
    const buffer = await filesystem.getBuffer ? await filesystem.getBuffer(pathOnDisk) : Buffer.from(await filesystem.get(pathOnDisk));
    return new Attachment({
      buffer,
      name: name || pathOnDisk.split("/").pop(),
      mime: "application/octet-stream"
    });
  }
}

export class EmbeddedImage extends Attachment {
  constructor(options = {}) {
    super(options);
    this.cid = options.cid || `cid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
}

export default Attachment;
