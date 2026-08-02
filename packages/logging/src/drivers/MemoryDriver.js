import { BaseDriver } from './BaseDriver.js';

/**
 * Memory Driver for storing log records in memory.
 * Useful for tests and DevTools.
 */
export class MemoryDriver extends BaseDriver {
  constructor(options = {}) {
    super(options);
    this.records = [];
    this.capacity = options.capacity || 1000;
  }

  async write(record) {
    let entry = record;
    if (typeof record === 'string') {
      try {
        entry = JSON.parse(record);
      } catch {
        entry = record;
      }
    }
    this.records.push(entry);
    if (this.records.length > this.capacity) {
      this.records.shift();
    }
  }

  getRecords() {
    return [...this.records];
  }

  clear() {
    this.records = [];
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

export default MemoryDriver;
