import fs from 'node:fs';
import path from 'node:path';
import { BaseDriver } from './BaseDriver.js';

/**
 * Single File Append Driver.
 */
export class FileDriver extends BaseDriver {
  constructor(options = {}) {
    super(options);
    this.filePath = options.path || './storage/logs/ecf.log';
    this.ensureDirectory();
  }

  ensureDirectory() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async write(record) {
    const content = (typeof record === 'string' ? record : JSON.stringify(record)) + '\n';
    await fs.promises.appendFile(this.filePath, content, 'utf-8');
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

export default FileDriver;
