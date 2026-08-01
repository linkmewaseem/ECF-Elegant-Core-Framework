/**
 * MediaResult — Immutable result object returned after processing completes.
 * Contains all variants, metadata, storage paths and processing trace.
 */
export class MediaResult {
  constructor({
    originalName,
    mimeType,
    size,
    duration = null,
    variants = {},
    metadata = null,
    storedPath = null,
    disk = null,
    processedAt = new Date(),
    trace = [],
  } = {}) {
    this.originalName = originalName;
    this.mimeType = mimeType;
    this.size = size;
    this.duration = duration;
    this.variants = variants;      // { thumbnail: { path, size, width, height, format }, ... }
    this.metadata = metadata;      // MediaMetadata instance
    this.storedPath = storedPath;  // primary stored path
    this.disk = disk;
    this.processedAt = processedAt;
    this.trace = trace;            // DevTools: pipeline step timing array
    Object.freeze(this);
  }

  hasVariant(name) {
    return name in this.variants;
  }

  getVariant(name) {
    return this.variants[name] ?? null;
  }

  allVariantNames() {
    return Object.keys(this.variants);
  }

  toObject() {
    return {
      originalName: this.originalName,
      mimeType: this.mimeType,
      size: this.size,
      storedPath: this.storedPath,
      disk: this.disk,
      variants: this.variants,
      processedAt: this.processedAt,
    };
  }
}

export default MediaResult;
