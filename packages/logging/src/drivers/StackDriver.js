import { BaseDriver } from './BaseDriver.js';

/**
 * Stack Driver for multiplexing logs to an array of channel drivers.
 */
export class StackDriver extends BaseDriver {
  constructor(options = {}) {
    super(options);
    this.channels = options.channels || []; // array of driver instances or resolved channels
    this.ignoreExceptions = options.ignoreExceptions ?? true;
  }

  async write(record) {
    const promises = this.channels.map(async (ch) => {
      try {
        if (ch && typeof ch.write === 'function') {
          await ch.write(record);
        }
      } catch (err) {
        if (!this.ignoreExceptions) throw err;
      }
    });
    await Promise.all(promises);
  }

  getCapabilities() {
    return {
      supportsJson: true,
      supportsBatch: true,
      supportsRetry: false,
      supportsRotation: true,
      supportsCompression: true,
      supportsArchive: true,
    };
  }
}

export default StackDriver;
