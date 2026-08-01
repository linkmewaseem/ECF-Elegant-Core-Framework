/**
 * MediaProfile — Declarative processing profile.
 *
 * A profile bundles variants, quality, format, watermark settings,
 * and optimization strategy so developers only need one line:
 *
 *   Media.image(file).profile("product").store("images", "s3")
 */
export class MediaProfile {
  #name;
  #variants;
  #format;
  #quality;
  #optimize;
  #stripMetadata;
  #watermark;
  #responsive;
  #queueOnDisk;

  constructor(name) {
    this.#name = name;
    this.#variants = {};
    this.#format = "webp";
    this.#quality = 82;
    this.#optimize = "web";
    this.#stripMetadata = true;
    this.#watermark = null;
    this.#responsive = false;
    this.#queueOnDisk = null;
  }

  /**
   * Add a named variant to this profile.
   * @param {string} variantName
   * @param {{ width?: number, height?: number, fit?: string, format?: string, quality?: number }} opts
   */
  addVariant(variantName, opts = {}) {
    this.#variants[variantName] = opts;
    return this;
  }

  format(fmt) { this.#format = fmt; return this; }
  quality(q) { this.#quality = q; return this; }
  optimize(strategy) { this.#optimize = strategy; return this; }
  stripMetadata(strip = true) { this.#stripMetadata = strip; return this; }
  watermark(source, opts = {}) { this.#watermark = { source, ...opts }; return this; }
  responsive(enabled = true) { this.#responsive = enabled; return this; }
  queueOn(disk) { this.#queueOnDisk = disk; return this; }

  getName() { return this.#name; }
  getVariants() { return this.#variants; }
  getFormat() { return this.#format; }
  getQuality() { return this.#quality; }
  getOptimize() { return this.#optimize; }
  shouldStripMetadata() { return this.#stripMetadata; }
  getWatermark() { return this.#watermark; }
  isResponsive() { return this.#responsive; }
  getQueueDisk() { return this.#queueOnDisk; }
}

// ─── Built-in Profiles ───────────────────────────────────────────────────────

export const BuiltInProfiles = {
  /**
   * product: e-commerce product images
   * Generates: thumbnail (200px), medium (600px), large (1200px), webp
   */
  product: () =>
    new MediaProfile("product")
      .addVariant("thumbnail", { width: 200, height: 200, fit: "cover" })
      .addVariant("medium", { width: 600, height: 600, fit: "inside" })
      .addVariant("large", { width: 1200, height: 1200, fit: "inside" })
      .format("webp")
      .quality(82)
      .optimize("web")
      .stripMetadata(true),

  /**
   * avatar: user profile pictures
   * Generates: small (64px), medium (128px), large (256px), circle-safe webp
   */
  avatar: () =>
    new MediaProfile("avatar")
      .addVariant("small", { width: 64, height: 64, fit: "cover" })
      .addVariant("medium", { width: 128, height: 128, fit: "cover" })
      .addVariant("large", { width: 256, height: 256, fit: "cover" })
      .format("webp")
      .quality(88)
      .optimize("web")
      .stripMetadata(true),

  /**
   * hero: full-width hero banners (responsive + large)
   */
  hero: () =>
    new MediaProfile("hero")
      .addVariant("mobile", { width: 768, fit: "cover" })
      .addVariant("tablet", { width: 1280, fit: "cover" })
      .addVariant("desktop", { width: 1920, fit: "cover" })
      .format("webp")
      .quality(85)
      .optimize("web")
      .stripMetadata(true)
      .responsive(true),

  /**
   * banner: marketing banners
   */
  banner: () =>
    new MediaProfile("banner")
      .addVariant("sm", { width: 640, fit: "cover" })
      .addVariant("md", { width: 1024, fit: "cover" })
      .addVariant("lg", { width: 1440, fit: "cover" })
      .format("webp")
      .quality(80)
      .optimize("web")
      .stripMetadata(true),
};

export default MediaProfile;
