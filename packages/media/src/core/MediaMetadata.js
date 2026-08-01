/**
 * MediaMetadata — Complete metadata extraction result.
 * Covers image EXIF, GPS, camera info, color space, and video/audio codec info.
 */
export class MediaMetadata {
  constructor(raw = {}) {
    // General
    this.format = raw.format ?? null;
    this.width = raw.width ?? null;
    this.height = raw.height ?? null;
    this.size = raw.size ?? null;
    this.orientation = raw.orientation ?? null;
    this.hasAlpha = raw.hasAlpha ?? false;
    this.colorSpace = raw.space ?? raw.colorSpace ?? null;
    this.density = raw.density ?? null;       // DPI
    this.channels = raw.channels ?? null;
    this.depth = raw.depth ?? null;           // bit depth
    this.isAnimated = raw.pages > 1 || false; // animated GIF/WebP

    // EXIF data (camera metadata)
    const exif = raw.exif ?? {};
    this.exif = {
      make: exif.Make ?? null,
      model: exif.Model ?? null,
      software: exif.Software ?? null,
      dateTime: exif.DateTime ?? null,
      exposureTime: exif.ExposureTime ?? null,
      fNumber: exif.FNumber ?? null,
      iso: exif.ISOSpeedRatings ?? null,
      focalLength: exif.FocalLength ?? null,
      lens: exif.LensModel ?? null,
      flash: exif.Flash ?? null,
    };

    // GPS data (extracted from EXIF)
    const gps = raw.gps ?? {};
    this.gps = {
      latitude: gps.GPSLatitude ?? null,
      longitude: gps.GPSLongitude ?? null,
      altitude: gps.GPSAltitude ?? null,
    };

    // ICC color profile
    this.icc = raw.icc ? { present: true, description: raw.icc.description ?? null } : null;

    // Video/Audio-specific
    this.duration = raw.duration ?? null;
    this.fps = raw.fps ?? null;
    this.bitrate = raw.bitrate ?? null;
    this.codec = raw.codec ?? null;
    this.audioCodec = raw.audioCodec ?? null;
    this.audioBitrate = raw.audioBitrate ?? null;
    this.audioChannels = raw.audioChannels ?? null;
    this.rotation = raw.rotation ?? null;
    this.hdr = raw.hdr ?? false;

    // Keep raw for advanced consumers
    this._raw = raw;
  }

  hasGps() {
    return this.gps.latitude !== null && this.gps.longitude !== null;
  }

  hasExif() {
    return Object.values(this.exif).some((v) => v !== null);
  }

  isPortrait() {
    return this.height !== null && this.width !== null && this.height > this.width;
  }

  isLandscape() {
    return this.width !== null && this.height !== null && this.width > this.height;
  }

  toObject() {
    return {
      format: this.format,
      width: this.width,
      height: this.height,
      size: this.size,
      orientation: this.orientation,
      hasAlpha: this.hasAlpha,
      colorSpace: this.colorSpace,
      density: this.density,
      channels: this.channels,
      depth: this.depth,
      isAnimated: this.isAnimated,
      exif: this.exif,
      gps: this.gps,
      icc: this.icc,
      duration: this.duration,
      fps: this.fps,
      bitrate: this.bitrate,
      codec: this.codec,
      rotation: this.rotation,
      hdr: this.hdr,
    };
  }
}

export default MediaMetadata;
