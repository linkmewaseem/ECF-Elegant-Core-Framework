import { MediaManager } from '../internal/MediaManager.js';

let _instance = null;

/**
 * MediaFacade — Static proxy to the bound MediaManager instance.
 *
 * Usage:
 *   import { Media } from '@ecf/media'
 *
 *   Media.image(uploadedFile).resize(800, 600).webp().store("images", "s3")
 *   Media.extend("cloudinary", new CloudinaryDriver())
 *   Media.defineProfile("product").addVariant("thumb", { width: 200 })
 *   Media.metadata(uploadedFile)
 */
export class MediaFacade {
  static bind(manager) {
    _instance = manager;
  }

  static getManager() {
    if (!_instance) throw new Error("MediaFacade: MediaManager not bound. Ensure MediaServiceProvider is registered.");
    return _instance;
  }

  static image(source, driverName = null) {
    return MediaFacade.getManager().image(source, driverName);
  }

  static imageRaw(buffer, opts = {}) {
    return MediaFacade.getManager().imageRaw(buffer, opts);
  }

  static metadata(source) {
    return MediaFacade.getManager().metadata(source);
  }

  static extend(name, driver) {
    return MediaFacade.getManager().extend(name, driver);
  }

  static defineProfile(name) {
    return MediaFacade.getManager().defineProfile(name);
  }

  static useImageDriver(name) {
    return MediaFacade.getManager().useImageDriver(name);
  }

  static availableDrivers() {
    return MediaFacade.getManager().availableDrivers();
  }
}

// Named export alias for developer ergonomics
export const Media = MediaFacade;

export default MediaFacade;
