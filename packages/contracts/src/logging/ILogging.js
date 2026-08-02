/**
 * @typedef {Object} DriverCapabilities
 * @property {boolean} supportsJson
 * @property {boolean} supportsBatch
 * @property {boolean} supportsRetry
 * @property {boolean} supportsRotation
 * @property {boolean} supportsCompression
 * @property {boolean} supportsArchive
 */

/**
 * Interface for Log Manager.
 * @interface ILogManager
 */
export class ILogManager {
  channel(name) {
    throw new Error('Method channel() must be implemented.');
  }

  stack(channels) {
    throw new Error('Method stack() must be implemented.');
  }

  withContext(context, callback) {
    throw new Error('Method withContext() must be implemented.');
  }

  fake() {
    throw new Error('Method fake() must be implemented.');
  }
}

/**
 * Interface for Log Drivers.
 * @interface ILogDriver
 */
export class ILogDriver {
  /**
   * Write a log record.
   * @param {Object} record
   */
  async write(record) {
    throw new Error('Method write() must be implemented.');
  }

  /**
   * Return driver capability matrix.
   * @returns {DriverCapabilities}
   */
  getCapabilities() {
    return {
      supportsJson: false,
      supportsBatch: false,
      supportsRetry: false,
      supportsRotation: false,
      supportsCompression: false,
      supportsArchive: false,
    };
  }
}

/**
 * Interface for Log Formatters.
 * @interface ILogFormatter
 */
export class ILogFormatter {
  /**
   * Format a log record.
   * @param {Object} record
   * @returns {string|Object}
   */
  format(record) {
    throw new Error('Method format() must be implemented.');
  }
}

/**
 * Interface for Log Processors.
 * @interface ILogProcessor
 */
export class ILogProcessor {
  /**
   * Process and enrich log record.
   * @param {Object} record
   * @returns {Object}
   */
  process(record) {
    throw new Error('Method process() must be implemented.');
  }
}

/**
 * Interface for Log Maskers.
 * @interface ILogMasker
 */
export class ILogMasker {
  /**
   * Redact sensitive fields in context/record.
   * @param {Object} data
   * @returns {Object}
   */
  mask(data) {
    throw new Error('Method mask() must be implemented.');
  }
}

export default ILogDriver;
