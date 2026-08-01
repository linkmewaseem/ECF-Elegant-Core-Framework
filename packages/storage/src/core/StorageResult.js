export class StorageResult {
  constructor(data = {}) {
    this.success = data.success ?? true;
    this.path = data.path || "";
    this.disk = data.disk || "local";
    this.size = data.size ?? 0;
    this.checksum = data.checksum || null;
    this.mime = data.mime || "application/octet-stream";
    this.visibility = data.visibility || "private";
    this.duration = data.duration ?? 0; // ms
    this.driver = data.driver || "local";
    this.error = data.error || null;
  }
}

export default StorageResult;
