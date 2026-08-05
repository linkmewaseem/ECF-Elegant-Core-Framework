import { ILogDriver } from '@ecfjs/contracts';

/**
 * Abstract Base Log Driver.
 */
export class BaseDriver extends ILogDriver {
  constructor(options = {}) {
    super();
    this.options = options;
  }

  async write(record) {
    throw new Error('Method write() must be implemented by driver.');
  }

  getCapabilities() {
    return {
      supportsJson: true,
      supportsBatch: false,
      supportsRetry: false,
      supportsRotation: false,
      supportsCompression: false,
      supportsArchive: false,
    };
  }
}

export default BaseDriver;
