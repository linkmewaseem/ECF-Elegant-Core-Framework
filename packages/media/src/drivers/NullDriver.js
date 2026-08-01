import { IMediaDriver } from '../contracts/IMediaDriver.js';
import { MediaMetadata } from '../core/MediaMetadata.js';

/**
 * NullDriver — Zero-dependency fallback driver.
 *
 * Used in testing, CI environments without native addons,
 * or as a safe-pass-through for file types that need no transformation.
 * Returns the original buffer unchanged with a minimal metadata stub.
 */
export class NullDriver extends IMediaDriver {
  name() { return "null"; }

  canHandle(type) { return true; } // handles everything as a passthrough

  async process(mediaFile, transformations) {
    const buffer = mediaFile.getBuffer() ?? Buffer.alloc(0);
    return { buffer, metadata: new MediaMetadata({ format: "unknown" }) };
  }

  async getMetadata(mediaFile) {
    return new MediaMetadata({
      format: "unknown",
      width: null,
      height: null,
      size: mediaFile.getSize(),
    });
  }

  async toBuffer(mediaFile) {
    return mediaFile.getBuffer() ?? Buffer.alloc(0);
  }
}

export default NullDriver;
