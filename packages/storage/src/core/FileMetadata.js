export class FileMetadata {
  constructor(data = {}) {
    this.path = data.path || "";
    this.disk = data.disk || "local";
    this.size = data.size ?? 0;
    this.mimeType = data.mimeType || "application/octet-stream";
    this.lastModified = data.lastModified ? new Date(data.lastModified) : new Date();
    this.etag = data.etag || null;
    this.checksum = data.checksum || null;
    this.visibility = data.visibility || "private";
    this.isFile = data.isFile ?? true;
    this.isDirectory = data.isDirectory ?? false;
  }
}

export default FileMetadata;
