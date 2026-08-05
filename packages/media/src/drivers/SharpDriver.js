import { IMediaDriver } from '../contracts/IMediaDriver.js';
import { MediaMetadata } from '../core/MediaMetadata.js';
import { MediaProcessingException, UnsupportedMediaTypeException } from '../exceptions/MediaException.js';
import { MediaSecurityValidator } from '../security/MediaSecurityValidator.js';

/**
 * SharpDriver — Native image processing driver using `sharp`.
 *
 * Supports: JPEG, PNG, WebP, AVIF, GIF, TIFF, SVG, HEIF.
 * Performs security validation (pixel bomb, zip bomb, SVG injection)
 * before processing any image.
 */
export class SharpDriver extends IMediaDriver {
  #sharp = null;

  constructor() {
    super();
    this.#sharp = null; // lazy-loaded
  }

  name() { return "sharp"; }

  canHandle(type) { return type === "image"; }

  async #loadSharp() {
    if (this.#sharp) return this.#sharp;
    try {
      const mod = await import("sharp");
      this.#sharp = mod.default ?? mod;
      return this.#sharp;
    } catch {
      throw new MediaProcessingException(
        'Sharp is not installed. Run: pnpm add sharp --filter @ecfjs/media'
      );
    }
  }

  /**
   * Retrieve raw image metadata securely.
   * @param {import('../core/MediaFile.js').MediaFile} mediaFile
   * @returns {Promise<MediaMetadata>}
   */
  async getMetadata(mediaFile) {
    const sharp = await this.#loadSharp();
    const buffer = mediaFile.getBuffer();
    if (!buffer) throw new MediaProcessingException("SharpDriver requires a buffer to extract metadata.");

    // SVG security check
    if (mediaFile.getMimeType() === "image/svg+xml") {
      MediaSecurityValidator.validateSvg(buffer);
    }

    try {
      const instance = sharp(buffer);
      const raw = await instance.metadata();

      // Security validation on raw metadata
      MediaSecurityValidator.validateImageMeta(raw, buffer);

      return new MediaMetadata(raw);
    } catch (err) {
      if (err.name === "MediaSecurityException") throw err;
      throw new MediaProcessingException(`Metadata extraction failed: ${err.message}`, err);
    }
  }

  /**
   * Process a MediaFile through a list of transformation instructions.
   *
   * @param {import('../core/MediaFile.js').MediaFile} mediaFile
   * @param {Array<{type: string, args: any[]}>} transformations
   * @returns {Promise<{ buffer: Buffer, metadata: MediaMetadata }>}
   */
  async process(mediaFile, transformations = []) {
    const sharp = await this.#loadSharp();
    const buffer = mediaFile.getBuffer();
    if (!buffer) throw new MediaProcessingException("SharpDriver requires an in-memory buffer to process.");

    // SVG security check early
    if (mediaFile.getMimeType() === "image/svg+xml") {
      MediaSecurityValidator.validateSvg(buffer);
    }

    let instance = sharp(buffer, { failOn: "truncated" });

    // Pre-flight: get metadata and validate security
    const rawMeta = await instance.metadata();
    MediaSecurityValidator.validateImageMeta(rawMeta, buffer);

    // Re-create instance after metadata read (sharp streams are single-use)
    instance = sharp(buffer);

    // Apply transformations sequentially
    for (const t of transformations) {
      instance = this.#applyTransformation(instance, t, rawMeta);
    }

    try {
      const outputBuffer = await instance.toBuffer();
      const outputMeta = await sharp(outputBuffer).metadata();
      return { buffer: outputBuffer, metadata: new MediaMetadata(outputMeta) };
    } catch (err) {
      throw new MediaProcessingException(`Image processing failed: ${err.message}`, err);
    }
  }

  /**
   * Apply a single named transformation to a sharp instance.
   * @param {object} instance - sharp pipeline instance
   * @param {{ type: string, args: any[] }} t
   * @param {object} rawMeta
   */
  #applyTransformation(instance, t, rawMeta) {
    switch (t.type) {
      case "resize": {
        const [width, height, opts = {}] = t.args;
        return instance.resize(width ?? null, height ?? null, {
          fit: opts.fit ?? "cover",
          position: opts.position ?? "centre",
          background: opts.background ?? { r: 255, g: 255, b: 255, alpha: 1 },
          withoutEnlargement: opts.withoutEnlargement ?? false,
          ...opts,
        });
      }
      case "crop": {
        const [left, top, width, height] = t.args;
        return instance.extract({ left, top, width, height });
      }
      case "fit": {
        // Used when only the fit strategy is set without resize dimensions
        const [mode] = t.args;
        return instance.resize(rawMeta.width, rawMeta.height, { fit: mode });
      }
      case "rotate": {
        const [degrees, opts = {}] = t.args;
        return instance.rotate(degrees, { background: opts.background ?? { r: 255, g: 255, b: 255, alpha: 1 } });
      }
      case "autoRotate":
        return instance.rotate(); // EXIF orientation auto-correction
      case "flip":
        return instance.flip();
      case "flop":
        return instance.flop();
      case "blur": {
        const [sigma] = t.args;
        return instance.blur(sigma ?? 3);
      }
      case "sharpen": {
        const [opts = {}] = t.args;
        return instance.sharpen(opts);
      }
      case "grayscale":
        return instance.grayscale(true);
      case "sepia":
        // Sharp doesn't have native sepia — use tint approximation
        return instance.tint({ r: 112, g: 66, b: 20 });
      case "watermark": {
        const [watermarkBuffer, opts = {}] = t.args;
        if (!watermarkBuffer) return instance;
        return instance.composite([{
          input: watermarkBuffer,
          gravity: opts.gravity ?? "southeast",
          blend: "over",
          ...(opts.top !== undefined ? { top: opts.top } : {}),
          ...(opts.left !== undefined ? { left: opts.left } : {}),
        }]);
      }
      case "canvas": {
        const [width, height, background = "#ffffff"] = t.args;
        return instance.extend({
          top: 0, bottom: 0, left: 0, right: 0,
          background,
        }).resize(width, height, { fit: "contain", background });
      }
      case "stripMetadata":
        return instance.withMetadata(false);
      case "format": {
        const [fmt, opts = {}] = t.args;
        return instance.toFormat(fmt, opts);
      }
      case "jpeg":
        return instance.jpeg(t.args[0] ?? { quality: 85, progressive: true });
      case "png":
        return instance.png(t.args[0] ?? { compressionLevel: 9 });
      case "webp":
        return instance.webp(t.args[0] ?? { quality: 82, lossless: false });
      case "avif":
        return instance.avif(t.args[0] ?? { quality: 50, lossless: false });
      case "tiff":
        return instance.tiff(t.args[0] ?? { quality: 85 });
      default:
        // Unknown transformation — skip gracefully, do not throw
        return instance;
    }
  }
}

export default SharpDriver;
