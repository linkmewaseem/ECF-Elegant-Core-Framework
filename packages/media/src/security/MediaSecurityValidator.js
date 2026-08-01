import { MediaSecurityException, MediaValidationException } from '../exceptions/MediaException.js';

/**
 * MediaSecurityValidator — Production security guard for media uploads.
 *
 * Detects:
 *  - Pixel bombs (canvas too large)
 *  - Zip bombs / decompression attacks (tiny file → huge canvas)
 *  - Oversized animated GIF frame limits
 *  - SVG with embedded scripts / external references
 *  - Memory exhaustion via unreasonable dimensions
 */
export class MediaSecurityValidator {
  // Safety limits
  static MAX_PIXEL_COUNT = 268_435_456; // 256 megapixels (16384×16384)
  static MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
  static MAX_IMAGE_DIMENSION = 16_384; // px per side
  static MAX_ANIMATED_FRAMES = 256;
  static MAX_CANVAS_BYTES = 1024 * 1024 * 1024; // 1GB decompressed canvas

  /**
   * Validate an image buffer or metadata object.
   * @param {{ width: number, height: number, pages?: number, size?: number, format?: string }} info
   * @param {Buffer} [rawBuffer]
   */
  static validateImageMeta(info, rawBuffer = null) {
    const { width = 0, height = 0, pages = 1, format } = info;

    // Pixel bomb check — total pixel count
    const pixels = width * height;
    if (pixels > MediaSecurityValidator.MAX_PIXEL_COUNT) {
      throw new MediaSecurityException(
        `Pixel bomb detected: ${pixels.toLocaleString()} pixels (max ${MediaSecurityValidator.MAX_PIXEL_COUNT.toLocaleString()})`,
        { width, height, pixels }
      );
    }

    // Dimension sanity
    if (width > MediaSecurityValidator.MAX_IMAGE_DIMENSION || height > MediaSecurityValidator.MAX_IMAGE_DIMENSION) {
      throw new MediaSecurityException(
        `Image dimension exceeds maximum allowed size: ${width}×${height}`,
        { width, height }
      );
    }

    // Animated GIF / WebP frame limit
    if (pages > MediaSecurityValidator.MAX_ANIMATED_FRAMES) {
      throw new MediaSecurityException(
        `Animated image frame count exceeds limit: ${pages} frames (max ${MediaSecurityValidator.MAX_ANIMATED_FRAMES})`,
        { pages }
      );
    }

    // Memory exhaustion — decompressed canvas estimate (4 bytes RGBA per pixel × frames)
    const estimatedCanvasBytes = pixels * 4 * pages;
    if (estimatedCanvasBytes > MediaSecurityValidator.MAX_CANVAS_BYTES) {
      throw new MediaSecurityException(
        `Image would exhaust memory: estimated ${(estimatedCanvasBytes / 1024 / 1024).toFixed(1)}MB canvas`,
        { width, height, pages, estimatedCanvasBytes }
      );
    }

    // Zip bomb detection: compare compressed size to expected size
    if (rawBuffer && rawBuffer.length < 1024) {
      // Very small file producing huge canvas is suspicious
      const compressionRatio = estimatedCanvasBytes / rawBuffer.length;
      if (compressionRatio > 10_000) {
        throw new MediaSecurityException(
          `Possible zip-bomb: compression ratio ${Math.round(compressionRatio).toLocaleString()}:1`,
          { bufferSize: rawBuffer.length, estimatedCanvasBytes, compressionRatio }
        );
      }
    }
  }

  /**
   * Validate an SVG buffer for embedded scripts and external references.
   * @param {Buffer} buffer
   */
  static validateSvg(buffer) {
    const content = buffer.toString("utf8");

    // Disallow script tags
    if (/<script[\s>]/i.test(content)) {
      throw new MediaSecurityException("SVG contains embedded <script> tag — rejected.", { type: "svg_script" });
    }

    // Disallow event handlers
    if (/\bon\w+\s*=/i.test(content)) {
      throw new MediaSecurityException("SVG contains inline event handler — rejected.", { type: "svg_event_handler" });
    }

    // Disallow external href / xlink:href / src with non-data URLs
    if (/(?:href|src)\s*=\s*["'](?!data:)[^"']*["']/i.test(content)) {
      throw new MediaSecurityException("SVG contains external resource reference — rejected.", { type: "svg_external_ref" });
    }

    // Disallow foreignObject (allows HTML injection)
    if (/<foreignObject/i.test(content)) {
      throw new MediaSecurityException("SVG contains <foreignObject> — rejected.", { type: "svg_foreign_object" });
    }

    // Disallow use of entity-based attacks (DOCTYPE / ENTITY)
    if (/<!DOCTYPE|<!ENTITY/i.test(content)) {
      throw new MediaSecurityException("SVG contains DOCTYPE/ENTITY declaration — rejected.", { type: "svg_entity" });
    }
  }

  /**
   * Validate file size limit.
   * @param {number} size
   */
  static validateFileSize(size) {
    if (size > MediaSecurityValidator.MAX_FILE_SIZE) {
      throw new MediaValidationException(
        `File size ${(size / 1024 / 1024).toFixed(1)}MB exceeds maximum allowed ${MediaSecurityValidator.MAX_FILE_SIZE / 1024 / 1024}MB`,
        { size }
      );
    }
  }
}

export default MediaSecurityValidator;
