import { MediaFile } from '../core/MediaFile.js';
import { MediaResult } from '../core/MediaResult.js';
import { MediaPipeline } from '../pipeline/MediaPipeline.js';
import { MediaSecurityValidator } from '../security/MediaSecurityValidator.js';
import { MediaProcessingException, UnsupportedMediaTypeException } from '../exceptions/MediaException.js';
import { ProfileNotFoundException, VariantNotFoundException } from '../exceptions/MediaException.js';

// Responsive image breakpoints (standard web breakpoints)
const RESPONSIVE_BREAKPOINTS = [320, 640, 768, 1024, 1280, 1440, 1920];

/**
 * ImageProcessor — Fluent image transformation builder.
 *
 * Fluent API:
 *   await Media.image(file)
 *       .resize(800, 600)
 *       .fit("cover")
 *       .webp({ quality: 85 })
 *       .watermark("/logo.png", { gravity: "se" })
 *       .stripMetadata()
 *       .store("images", "s3")
 *
 * Pipeline API:
 *   await Media.image(file)
 *       .pipeline()
 *       .use(new StripMetadata())
 *       .use(new Resize(800))
 *       .store("images", "local")
 *
 * Profile API:
 *   await Media.image(file)
 *       .profile("product")
 *       .store("products", "s3")
 *
 * Variant API:
 *   await Media.image(file)
 *       .variant("thumbnail", { width: 200, height: 200 })
 *       .variant("large", { width: 1200 })
 *       .store("images", "s3")
 *
 * Responsive API:
 *   await Media.image(file).responsive().store("images", "local")
 */
export class ImageProcessor {
  #mediaFile;
  #driver;
  #storageManager;
  #queueManager;
  #eventDispatcher;
  #profileRegistry;

  #transformations = [];
  #variants = {};
  #profileName = null;
  #responsive = false;
  #queueDisk = null;
  #customPipeline = null;
  #optimizeProfile = null;

  constructor(mediaFile, driver, { storage = null, queue = null, events = null, profiles = null } = {}) {
    this.#mediaFile = mediaFile;
    this.#driver = driver;
    this.#storageManager = storage;
    this.#queueManager = queue;
    this.#eventDispatcher = events;
    this.#profileRegistry = profiles;
  }

  // ─── Transformation Fluent API ─────────────────────────────────────────────

  resize(width, height, options = {}) {
    this.#transformations.push({ type: "resize", args: [width, height, options] });
    return this;
  }

  crop(x, y, width, height) {
    this.#transformations.push({ type: "crop", args: [x, y, width, height] });
    return this;
  }

  fit(mode = "cover") {
    this.#transformations.push({ type: "fit", args: [mode] });
    return this;
  }

  autoRotate() {
    this.#transformations.push({ type: "autoRotate", args: [] });
    return this;
  }

  rotate(degrees, options = {}) {
    this.#transformations.push({ type: "rotate", args: [degrees, options] });
    return this;
  }

  flip() {
    this.#transformations.push({ type: "flip", args: [] });
    return this;
  }

  flop() {
    this.#transformations.push({ type: "flop", args: [] });
    return this;
  }

  blur(sigma = 3) {
    this.#transformations.push({ type: "blur", args: [sigma] });
    return this;
  }

  sharpen(options = {}) {
    this.#transformations.push({ type: "sharpen", args: [options] });
    return this;
  }

  grayscale() {
    this.#transformations.push({ type: "grayscale", args: [] });
    return this;
  }

  sepia() {
    this.#transformations.push({ type: "sepia", args: [] });
    return this;
  }

  watermark(source, options = {}) {
    // source can be a Buffer or a filesystem path; resolved in process()
    this.#transformations.push({ type: "watermark", args: [source, options] });
    return this;
  }

  canvas(width, height, background = "#ffffff") {
    this.#transformations.push({ type: "canvas", args: [width, height, background] });
    return this;
  }

  stripMetadata() {
    this.#transformations.push({ type: "stripMetadata", args: [] });
    return this;
  }

  // ─── Format Output ────────────────────────────────────────────────────────

  jpeg(options = {}) {
    this.#transformations.push({ type: "jpeg", args: [{ quality: 85, progressive: true, ...options }] });
    return this;
  }

  png(options = {}) {
    this.#transformations.push({ type: "png", args: [{ compressionLevel: 9, ...options }] });
    return this;
  }

  webp(options = {}) {
    this.#transformations.push({ type: "webp", args: [{ quality: 82, ...options }] });
    return this;
  }

  avif(options = {}) {
    this.#transformations.push({ type: "avif", args: [{ quality: 50, ...options }] });
    return this;
  }

  toFormat(format, options = {}) {
    this.#transformations.push({ type: "format", args: [format, options] });
    return this;
  }

  // ─── Optimization Profiles ────────────────────────────────────────────────

  /**
   * Apply a smart optimization preset.
   * @param {"web" | "archive" | "thumbnail" | "print"} strategyName
   */
  optimize(strategyName = "web") {
    this.#optimizeProfile = strategyName;
    const presets = {
      web:       [{ type: "webp", args: [{ quality: 82, effort: 4 }] }],
      archive:   [{ type: "png",  args: [{ compressionLevel: 9 }] }],
      thumbnail: [{ type: "webp", args: [{ quality: 70, nearLossless: true }] }],
      print:     [{ type: "tiff", args: [{ quality: 100, compression: "lzw" }] }],
    };
    const steps = presets[strategyName] ?? presets.web;
    this.#transformations.push(...steps);
    return this;
  }

  // ─── Variant API ──────────────────────────────────────────────────────────

  /**
   * Register a named output variant.
   * @param {string} name - variant name (e.g. "thumbnail", "large")
   * @param {{ width?: number, height?: number, fit?: string, format?: string, quality?: number }} opts
   */
  variant(name, opts = {}) {
    this.#variants[name] = opts;
    return this;
  }

  // ─── Profile API ──────────────────────────────────────────────────────────

  /**
   * Apply a registered Media Profile (loads variants, format, quality, watermark, etc.)
   * @param {string} name
   */
  profile(name) {
    this.#profileName = name;
    return this;
  }

  // ─── Responsive API ───────────────────────────────────────────────────────

  /**
   * Generate responsive breakpoint variants (320w, 640w, ... 1920w).
   */
  responsive() {
    this.#responsive = true;
    for (const bp of RESPONSIVE_BREAKPOINTS) {
      this.#variants[`${bp}w`] = { width: bp, fit: "inside", format: "webp", quality: 82 };
    }
    return this;
  }

  // ─── Custom Pipeline API ──────────────────────────────────────────────────

  /**
   * Switch to a custom middleware-based pipeline instead of the fluent API.
   * @returns {MediaPipeline}
   */
  pipeline() {
    this.#customPipeline = new MediaPipeline();
    return this.#customPipeline;
  }

  // ─── Queue Dispatch ───────────────────────────────────────────────────────

  /**
   * Dispatch processing as a background queue job.
   * @param {string} diskName - e.g. "media-processing"
   * @returns {Promise<void>}
   */
  async queueOn(diskName) {
    this.#queueDisk = diskName;
    if (!this.#queueManager) {
      throw new MediaProcessingException("Queue integration not available. Register @ecfjs/queue in MediaServiceProvider.");
    }
    const { ProcessMediaJob } = await import('../queue/ProcessMediaJob.js');
    await this.#queueManager.dispatch(new ProcessMediaJob({
      mediaFile: this.#mediaFile,
      transformations: this.#transformations,
      variants: this.#variants,
      profileName: this.#profileName,
    }), diskName);
  }

  // ─── store() — Primary Execution Entry Point ──────────────────────────────

  /**
   * Execute the full processing pipeline and store output via @ecfjs/storage.
   * @param {string} directory - storage directory (e.g. "products/images")
   * @param {string} [disk="local"] - storage disk name
   * @returns {Promise<MediaResult>}
   */
  async store(directory, disk = "local") {
    await this.#dispatch("MediaLoaded");

    // Security: file size check
    MediaSecurityValidator.validateFileSize(this.#mediaFile.getSize());

    // Resolve profile if set
    const resolvedProfile = this.#profileName
      ? this.#profileRegistry?.resolve(this.#profileName)
      : null;

    if (resolvedProfile) {
      this.#applyProfile(resolvedProfile);
    }

    let buffer = this.#mediaFile.getBuffer();
    if (!buffer) throw new MediaProcessingException("ImageProcessor requires an in-memory buffer.");

    await this.#dispatch("MediaValidated");

    const trace = [];
    const start = Date.now();

    // Process primary output
    const { buffer: outputBuffer, metadata } = await this.#driver.process(
      this.#mediaFile,
      this.#transformations
    );
    trace.push({ stage: "ProcessPrimary", durationMs: Date.now() - start });

    await this.#dispatch("MediaTransforming");

    // Determine output filename
    const ext = this.#resolveOutputExtension();
    const baseName = this.#mediaFile.getOriginalName().replace(/\.[^.]+$/, "");
    const primaryPath = `${directory}/${baseName}.${ext}`;

    // Store primary file
    const storedPrimary = await this.#storeBuffer(outputBuffer, primaryPath, disk);
    trace.push({ stage: "StorePrimary", durationMs: Date.now() - start });

    await this.#dispatch("MediaOptimized");

    // Process and store all variants
    const variantResults = {};
    for (const [variantName, variantOpts] of Object.entries(this.#variants)) {
      const variantTransformations = this.#buildVariantTransformations(variantOpts);
      const { buffer: variantBuffer, metadata: variantMeta } = await this.#driver.process(
        this.#mediaFile,
        variantTransformations
      );

      const variantFmt = variantOpts.format ?? ext;
      const variantPath = `${directory}/${baseName}_${variantName}.${variantFmt}`;
      await this.#storeBuffer(variantBuffer, variantPath, disk);

      variantResults[variantName] = {
        path: variantPath,
        size: variantBuffer.length,
        width: variantMeta.width,
        height: variantMeta.height,
        format: variantFmt,
      };
      trace.push({ stage: `StoreVariant:${variantName}`, durationMs: Date.now() - start });
    }

    await this.#dispatch("MediaEncoded");

    const result = new MediaResult({
      originalName: this.#mediaFile.getOriginalName(),
      mimeType: this.#mediaFile.getMimeType(),
      size: outputBuffer.length,
      storedPath: primaryPath,
      disk,
      variants: variantResults,
      metadata,
      processedAt: new Date(),
      trace,
    });

    await this.#dispatch("MediaStored", result);
    return result;
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  #applyProfile(profile) {
    // Apply profile-level format
    const fmt = profile.getFormat();
    if (fmt) this.#transformations.push({ type: fmt, args: [{ quality: profile.getQuality() }] });

    // Strip metadata if profile requires
    if (profile.shouldStripMetadata()) {
      this.#transformations.push({ type: "stripMetadata", args: [] });
    }

    // Merge profile variants into our variants map
    for (const [name, opts] of Object.entries(profile.getVariants())) {
      this.#variants[name] = opts;
    }
  }

  #buildVariantTransformations(opts) {
    const transformations = [];
    if (opts.width || opts.height) {
      transformations.push({ type: "resize", args: [opts.width ?? null, opts.height ?? null, { fit: opts.fit ?? "inside" }] });
    }
    const fmt = opts.format ?? this.#resolveOutputExtension();
    transformations.push({ type: fmt, args: [{ quality: opts.quality ?? 82 }] });
    return transformations;
  }

  #resolveOutputExtension() {
    const fmt = this.#transformations.findLast((t) => ["jpeg", "png", "webp", "avif", "tiff", "format"].includes(t.type));
    if (!fmt) return "webp"; // default to webp
    if (fmt.type === "format") return fmt.args[0];
    return fmt.type === "jpeg" ? "jpg" : fmt.type;
  }

  async #storeBuffer(buffer, path, disk) {
    if (!this.#storageManager) {
      // fallback: return the path without actual storage (testing mode)
      return path;
    }
    await this.#storageManager.disk(disk).put(path, buffer);
    return path;
  }

  async #dispatch(event, payload = null) {
    if (!this.#eventDispatcher) return;
    try {
      await this.#eventDispatcher.dispatch(event, payload ?? { mediaFile: this.#mediaFile });
    } catch {
      // Event dispatch is non-critical — never block processing
    }
  }
}

export default ImageProcessor;
