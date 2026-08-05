import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { BaseDriver } from './BaseDriver.js';

/**
 * Daily / Advanced Log Rotation Driver.
 * Supports daily, weekly, monthly, hourly, size, and hybrid rotation policies,
 * with optional gzip (.gz) compression, retention purging, and storage offloading.
 */
export class DailyDriver extends BaseDriver {
  constructor(options = {}) {
    super(options);
    this.basePath = options.path || './storage/logs/ecf.log';
    this.policy = options.policy || 'daily'; // daily, weekly, monthly, hourly, size, hybrid
    this.maxFiles = options.maxFiles || options.days || 14;
    this.maxSizeBytes = options.maxSizeBytes || 10 * 1024 * 1024; // 10MB default size policy
    this.compress = options.compress ?? true;
    this.storageDisk = options.storageDisk || null; // optional @ecfjs/storage disk instance for cloud archive
    this.currentFileIndex = 0;

    this.ensureDirectory();
  }

  ensureDirectory() {
    const dir = path.dirname(this.basePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Determine target log filename based on current rotation policy.
   * @returns {string}
   */
  getRotatedFilePath() {
    const now = new Date();
    const ext = path.extname(this.basePath);
    const baseWithoutExt = this.basePath.slice(0, -ext.length);

    let dateSuffix = '';
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');

    if (this.policy === 'hourly') {
      dateSuffix = `-${YYYY}-${MM}-${DD}-${HH}`;
    } else if (this.policy === 'monthly') {
      dateSuffix = `-${YYYY}-${MM}`;
    } else if (this.policy === 'weekly') {
      const week = Math.ceil(now.getDate() / 7);
      dateSuffix = `-${YYYY}-W${week}`;
    } else if (this.policy === 'size' || this.policy === 'hybrid') {
      dateSuffix = `-${YYYY}-${MM}-${DD}`;
    } else {
      // default 'daily'
      dateSuffix = `-${YYYY}-${MM}-${DD}`;
    }

    let targetPath = `${baseWithoutExt}${dateSuffix}${ext}`;

    // If size policy or hybrid, check if size limit exceeded
    if ((this.policy === 'size' || this.policy === 'hybrid') && fs.existsSync(targetPath)) {
      const stats = fs.statSync(targetPath);
      if (stats.size >= this.maxSizeBytes) {
        this.currentFileIndex++;
        targetPath = `${baseWithoutExt}${dateSuffix}.${this.currentFileIndex}${ext}`;
      }
    }

    return targetPath;
  }

  async write(record) {
    const targetFile = this.getRotatedFilePath();
    const content = (typeof record === 'string' ? record : JSON.stringify(record)) + '\n';
    await fs.promises.appendFile(targetFile, content, 'utf-8');

    // Run rotation maintenance check asynchronously
    this.rotateAndPurgeOldFiles(targetFile).catch(() => {});
  }

  async rotateAndPurgeOldFiles(currentActiveFile) {
    const dir = path.dirname(this.basePath);
    const ext = path.extname(this.basePath);
    const baseName = path.basename(this.basePath, ext);

    const files = await fs.promises.readdir(dir);
    const matchingFiles = files
      .filter((f) => f.startsWith(baseName) && (f.endsWith(ext) || f.endsWith('.gz')))
      .map((f) => path.join(dir, f))
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

    // Compress inactive files if compression enabled
    if (this.compress) {
      for (const filePath of matchingFiles) {
        if (filePath !== currentActiveFile && !filePath.endsWith('.gz')) {
          await this.compressFile(filePath);
        }
      }
    }

    // Purge or archive old files exceeding maxFiles count
    if (matchingFiles.length > this.maxFiles) {
      const excessFiles = matchingFiles.slice(this.maxFiles);
      for (const excessFile of excessFiles) {
        if (this.storageDisk && typeof this.storageDisk.put === 'function') {
          try {
            const fileData = await fs.promises.readFile(excessFile);
            await this.storageDisk.put(`logs/archive/${path.basename(excessFile)}`, fileData);
          } catch {
            // Keep local if offload fails
          }
        }
        await fs.promises.unlink(excessFile).catch(() => {});
      }
    }
  }

  async compressFile(filePath) {
    try {
      const gzPath = `${filePath}.gz`;
      const fileContent = await fs.promises.readFile(filePath);
      const compressed = zlib.gzipSync(fileContent);
      await fs.promises.writeFile(gzPath, compressed);
      await fs.promises.unlink(filePath);
    } catch {
      // Ignore failure during compression
    }
  }

  getCapabilities() {
    return {
      supportsJson: true,
      supportsBatch: true,
      supportsRetry: false,
      supportsRotation: true,
      supportsCompression: this.compress,
      supportsArchive: Boolean(this.storageDisk),
    };
  }
}

export default DailyDriver;
