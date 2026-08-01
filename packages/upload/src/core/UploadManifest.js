export class UploadManifest {
  constructor(data = {}) {
    this.id = data.id || `up_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.disk = data.disk || "local";
    this.path = data.path || "";
    this.originalName = data.originalName || "";
    this.mimeType = data.mimeType || "application/octet-stream";
    this.size = data.size || 0;
    this.hash = data.hash || null;
    this.visibility = data.visibility || "private";
    this.quarantined = data.quarantined ?? false;
    this.uploadedAt = data.uploadedAt ? new Date(data.uploadedAt) : new Date();
    this.metadata = data.metadata || {};
  }
}

export default UploadManifest;
