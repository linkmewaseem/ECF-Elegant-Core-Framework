/**
 * MediaFile — Core Value Object
 * Wraps any incoming file source (Buffer, path, URL, UploadedFile).
 */
export class MediaFile {
  /** @type {Buffer|null} */
  #buffer = null;
  /** @type {string|null} */
  #path = null;
  /** @type {string|null} */
  #originalName = null;
  /** @type {string|null} */
  #mimeType = null;
  /** @type {number} */
  #size = 0;
  /** @type {string} */
  #type = "unknown"; // image | video | audio | document | unknown

  constructor({ buffer = null, path = null, originalName = null, mimeType = null, size = 0 } = {}) {
    this.#buffer = buffer;
    this.#path = path;
    this.#originalName = originalName ?? "unknown";
    this.#mimeType = mimeType ?? "application/octet-stream";
    this.#size = size;
    this.#type = MediaFile.#resolveType(mimeType);
  }

  /**
   * Factory: from a raw Buffer
   */
  static fromBuffer(buffer, { originalName, mimeType } = {}) {
    return new MediaFile({ buffer, originalName, mimeType, size: buffer.length });
  }

  /**
   * Factory: from a file-system path
   */
  static fromPath(path, { originalName, mimeType } = {}) {
    const name = originalName ?? path.split(/[/\\]/).pop();
    return new MediaFile({ path, originalName: name, mimeType });
  }

  /**
   * Factory: from an @ecfjs/upload UploadedFile duck-type
   */
  static fromUploadedFile(uploadedFile) {
    return new MediaFile({
      buffer: uploadedFile.buffer ?? null,
      path: uploadedFile.path ?? null,
      originalName: uploadedFile.originalName ?? uploadedFile.name ?? "upload",
      mimeType: uploadedFile.mimeType ?? uploadedFile.mimetype ?? "application/octet-stream",
      size: uploadedFile.size ?? (uploadedFile.buffer?.length ?? 0),
    });
  }

  static #resolveType(mimeType) {
    if (!mimeType) return "unknown";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    return "document";
  }

  getBuffer() { return this.#buffer; }
  getPath() { return this.#path; }
  getOriginalName() { return this.#originalName; }
  getMimeType() { return this.#mimeType; }
  getSize() { return this.#size; }
  getType() { return this.#type; }

  isImage() { return this.#type === "image"; }
  isVideo() { return this.#type === "video"; }
  isAudio() { return this.#type === "audio"; }

  /** Check if buffer is available (no disk read needed) */
  hasBuffer() { return this.#buffer !== null && this.#buffer.length > 0; }

  toObject() {
    return {
      originalName: this.#originalName,
      mimeType: this.#mimeType,
      size: this.#size,
      type: this.#type,
      hasBuffer: this.hasBuffer(),
      path: this.#path,
    };
  }
}

export default MediaFile;
