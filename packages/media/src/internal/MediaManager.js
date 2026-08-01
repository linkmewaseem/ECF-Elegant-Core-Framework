import { MediaFile } from '../core/MediaFile.js';
import { ImageProcessor } from '../image/ImageProcessor.js';
import { NullDriver } from '../drivers/NullDriver.js';
import { SharpDriver } from '../drivers/SharpDriver.js';
import { MediaDriverNotFoundException, UnsupportedMediaTypeException } from '../exceptions/MediaException.js';
import { ProfileRegistry } from '../profiles/ProfileRegistry.js';
import { MediaProfile, BuiltInProfiles } from '../profiles/MediaProfile.js';

/**
 * MediaManager — Central driver registry and factory.
 *
 * Plugin-based driver registration:
 *   Media.extend("imagick", new ImagickDriver())
 *   Media.extend("cloudinary", new CloudinaryDriver())
 *
 * Profile registration:
 *   Media.profile("product").addVariant("thumb", { width: 200 })
 *
 * Primary factory method:
 *   Media.image(file)     → ImageProcessor
 *   Media.video(file)     → VideoProcessor (Phase 21B)
 *   Media.audio(file)     → AudioProcessor (Phase 21B)
 */
export class MediaManager {
  #drivers = new Map();
  #defaultImageDriver = null;
  #defaultVideoDriver = null;
  #defaultAudioDriver = null;
  #profileRegistry;
  #storage = null;
  #queue = null;
  #events = null;

  constructor() {
    this.#profileRegistry = new ProfileRegistry();
    this.#registerBuiltInDrivers();
    this.#registerBuiltInProfiles();
  }

  // ─── Driver Registry ──────────────────────────────────────────────────────

  #registerBuiltInDrivers() {
    this.#drivers.set("null", new NullDriver());
    this.#drivers.set("sharp", new SharpDriver());
    this.#defaultImageDriver = "sharp";
  }

  /**
   * Register a custom driver — enables community plugins.
   * @param {string} name - driver name (e.g. "cloudinary", "imagick")
   * @param {IMediaDriver} driverInstance
   */
  extend(name, driverInstance) {
    this.#drivers.set(name, driverInstance);
    return this;
  }

  /**
   * Set the default driver for image processing.
   */
  useImageDriver(name) {
    if (!this.#drivers.has(name)) {
      throw new MediaDriverNotFoundException(name);
    }
    this.#defaultImageDriver = name;
    return this;
  }

  driver(name) {
    const d = this.#drivers.get(name);
    if (!d) throw new MediaDriverNotFoundException(name);
    return d;
  }

  availableDrivers() { return [...this.#drivers.keys()]; }

  // ─── Profile Registry ─────────────────────────────────────────────────────

  #registerBuiltInProfiles() {
    for (const factory of Object.values(BuiltInProfiles)) {
      const p = factory();
      this.#profileRegistry.register(p);
    }
  }

  /**
   * Define or extend a media profile.
   * @param {string} name
   * @returns {MediaProfile}
   */
  defineProfile(name) {
    const profile = new MediaProfile(name);
    this.#profileRegistry.register(profile);
    return profile;
  }

  getProfileRegistry() { return this.#profileRegistry; }

  // ─── Service Integration ──────────────────────────────────────────────────

  setStorage(storageManager) { this.#storage = storageManager; return this; }
  setQueue(queueManager) { this.#queue = queueManager; return this; }
  setEvents(eventDispatcher) { this.#events = eventDispatcher; return this; }

  // ─── Factory Methods ──────────────────────────────────────────────────────

  /**
   * Create an ImageProcessor for the given file source.
   * @param {MediaFile|Buffer|object} source - MediaFile, Buffer, or @ecf/upload UploadedFile
   * @param {string} [driverName] - override driver (defaults to "sharp")
   * @returns {ImageProcessor}
   */
  image(source, driverName = null) {
    const mediaFile = this.#resolveMediaFile(source, "image");

    if (!mediaFile.isImage()) {
      throw new UnsupportedMediaTypeException(mediaFile.getMimeType());
    }

    const driver = this.driver(driverName ?? this.#defaultImageDriver);

    return new ImageProcessor(mediaFile, driver, {
      storage: this.#storage,
      queue: this.#queue,
      events: this.#events,
      profiles: this.#profileRegistry,
    });
  }

  /**
   * Create an ImageProcessor but bypass MIME type check (raw buffer).
   */
  imageRaw(buffer, { mimeType = "image/jpeg", originalName = "image.jpg" } = {}) {
    const mediaFile = MediaFile.fromBuffer(buffer, { mimeType, originalName });
    const driver = this.driver(this.#defaultImageDriver);
    return new ImageProcessor(mediaFile, driver, {
      storage: this.#storage,
      queue: this.#queue,
      events: this.#events,
      profiles: this.#profileRegistry,
    });
  }

  /**
   * Get image metadata without processing.
   * @param {MediaFile|Buffer|object} source
   * @returns {Promise<import('../core/MediaMetadata.js').MediaMetadata>}
   */
  async metadata(source) {
    const mediaFile = this.#resolveMediaFile(source, "image");
    const driver = this.driver(this.#defaultImageDriver);
    return await driver.getMetadata(mediaFile);
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  #resolveMediaFile(source, expectedType) {
    if (source instanceof MediaFile) return source;
    if (Buffer.isBuffer(source)) {
      return MediaFile.fromBuffer(source, { mimeType: `${expectedType}/jpeg`, originalName: `${expectedType}.jpg` });
    }
    // Assume @ecf/upload UploadedFile duck-type
    return MediaFile.fromUploadedFile(source);
  }
}

export default MediaManager;
