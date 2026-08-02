import { BaseDriver } from './BaseDriver.js';

/**
 * Null Driver (Black-hole logging).
 */
export class NullDriver extends BaseDriver {
  async write(_record) {
    // Discards log record
  }

  getCapabilities() {
    return {
      supportsJson: true,
      supportsBatch: true,
      supportsRetry: false,
      supportsRotation: false,
      supportsCompression: false,
      supportsArchive: false,
    };
  }
}

export default NullDriver;
