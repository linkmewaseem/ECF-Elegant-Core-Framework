import { LogMasker } from './LogMasker.js';
import { LogContext } from './LogContext.js';
import { JsonFormatter } from './formatters/JsonFormatter.js';
import { LogWriting, LogWritten, LogFailed, LogDropped } from './LogEvents.js';

/**
 * Log Execution Pipeline.
 */
export class LogPipeline {
  static LEVEL_PRIORITY = {
    emergency: 0,
    alert: 1,
    critical: 2,
    error: 3,
    warning: 4,
    notice: 5,
    info: 6,
    debug: 7,
    trace: 8,
  };

  constructor({
    channelName = 'default',
    driver = null,
    level = 'debug',
    processors = [],
    formatter = null,
    masker = null,
    samplingRules = null,
    eventEmitter = null,
  } = {}) {
    this.channelName = channelName;
    this.driver = driver;
    this.level = level.toLowerCase();
    this.processors = processors;
    this.formatter = formatter || new JsonFormatter();
    this.masker = masker || new LogMasker();
    this.samplingRules = samplingRules || {};
    this.eventEmitter = eventEmitter;
  }

  /**
   * Process log record through full pipeline.
   * @param {string} level
   * @param {string|Error} message
   * @param {Object} context
   * @returns {Promise<Object|null>}
   */
  async execute(level, message, context = {}) {
    const normLevel = level.toLowerCase();

    // 1. Check min log level threshold
    const incomingPriority = LogPipeline.LEVEL_PRIORITY[normLevel] ?? 6;
    const minPriority = LogPipeline.LEVEL_PRIORITY[this.level] ?? 7;

    if (incomingPriority > minPriority) {
      return null; // Suppressed due to log level filter
    }

    // 2. Check fine-grained sampling rules
    if (!this.shouldSample(normLevel)) {
      if (this.eventEmitter) {
        this.eventEmitter.emit('log.dropped', new LogDropped({ level: normLevel, message }, 'Sampling drop'));
      }
      return null;
    }

    // 3. Resolve context (ALS + OpenTelemetry + incoming context)
    const activeContext = LogContext.getActiveContext();
    const mergedContext = { ...activeContext, ...context };

    // 4. Sensitive Data Masking
    const maskedContext = this.masker.mask(mergedContext);

    // Build raw record
    let record = {
      timestamp: Date.now(),
      level: normLevel,
      message,
      channel: this.channelName,
      context: maskedContext,
      traceId: maskedContext.traceId || null,
      correlationId: maskedContext.correlationId || null,
    };

    // 5. Processors enrichment
    for (const processor of this.processors) {
      if (processor && typeof processor.process === 'function') {
        record = processor.process(record);
      }
    }

    // 6. Formatter
    const formattedPayload = this.formatter.format(record);

    // 7. Event: LogWriting
    if (this.eventEmitter) {
      this.eventEmitter.emit('log.writing', new LogWriting(record));
    }

    // 8. Driver Write
    try {
      if (this.driver && typeof this.driver.write === 'function') {
        await this.driver.write(formattedPayload);
      }

      // Event: LogWritten
      if (this.eventEmitter) {
        this.eventEmitter.emit('log.written', new LogWritten(record, this.channelName));
      }

      return record;
    } catch (err) {
      // Event: LogFailed
      if (this.eventEmitter) {
        this.eventEmitter.emit('log.failed', new LogFailed(record, err, this.channelName));
      }
      throw err;
    }
  }

  /**
   * Determine if log level passes sampling rules.
   * @param {string} normLevel
   * @returns {boolean}
   */
  shouldSample(normLevel) {
    if (normLevel === 'error' && this.samplingRules.sampleErrors === false) return false;
    if (normLevel === 'warning' && this.samplingRules.sampleWarnings === false) return false;

    let rate = 1.0;
    if (normLevel === 'debug' && typeof this.samplingRules.sampleDebug === 'number') {
      rate = this.samplingRules.sampleDebug;
    } else if (normLevel === 'info' && typeof this.samplingRules.sampleInfo === 'number') {
      rate = this.samplingRules.sampleInfo;
    } else if (typeof this.samplingRules.rate === 'number') {
      rate = this.samplingRules.rate;
    }

    if (rate >= 1.0) return true;
    if (rate <= 0.0) return false;
    return Math.random() < rate;
  }
}

export default LogPipeline;
