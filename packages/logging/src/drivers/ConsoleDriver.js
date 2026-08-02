import { BaseDriver } from './BaseDriver.js';

/**
 * Stdout / Stderr Stream Console Driver.
 */
export class ConsoleDriver extends BaseDriver {
  constructor(options = {}) {
    super(options);
    this.stderrThreshold = options.stderrThreshold || 'error';
  }

  async write(record) {
    const formatted = typeof record === 'string' ? record : JSON.stringify(record);
    const levelStr = String(record?.level || 'info').toLowerCase();

    if (['error', 'critical', 'alert', 'emergency'].includes(levelStr)) {
      process.stderr.write(formatted + '\n');
    } else {
      process.stdout.write(formatted + '\n');
    }
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

export default ConsoleDriver;
