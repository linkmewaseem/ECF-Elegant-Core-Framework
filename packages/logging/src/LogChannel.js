import { LogPipeline } from './LogPipeline.js';
import { LogBatcher } from './LogBatcher.js';

/**
 * Individual Log Channel Wrapper.
 */
export class LogChannel {
  constructor({
    name = 'default',
    driver = null,
    level = 'debug',
    processors = [],
    formatter = null,
    masker = null,
    samplingRules = null,
    eventEmitter = null,
    childContext = {},
  } = {}) {
    this.name = name;
    this.driver = driver;
    this.childContext = childContext;

    this.pipeline = new LogPipeline({
      channelName: name,
      driver,
      level,
      processors,
      formatter,
      masker,
      samplingRules,
      eventEmitter,
    });
  }

  /**
   * Log record with specific level.
   */
  async log(level, message, context = {}) {
    const mergedCtx = { ...this.childContext, ...context };
    return this.pipeline.execute(level, message, mergedCtx);
  }

  // RFC5424 + Trace shortcuts
  async emergency(message, context) { return this.log('emergency', message, context); }
  async alert(message, context) { return this.log('alert', message, context); }
  async critical(message, context) { return this.log('critical', message, context); }
  async error(message, context) { return this.log('error', message, context); }
  async warning(message, context) { return this.log('warning', message, context); }
  async notice(message, context) { return this.log('notice', message, context); }
  async info(message, context) { return this.log('info', message, context); }
  async debug(message, context) { return this.log('debug', message, context); }
  async trace(message, context) { return this.log('trace', message, context); }

  /**
   * Create an isolated child logger with pre-bound context.
   * @param {Object} context
   * @returns {LogChannel}
   */
  withContext(context) {
    const bound = typeof context === 'function' ? context() : context;
    return new LogChannel({
      name: this.name,
      driver: this.driver,
      level: this.pipeline.level,
      processors: this.pipeline.processors,
      formatter: this.pipeline.formatter,
      masker: this.pipeline.masker,
      samplingRules: this.pipeline.samplingRules,
      eventEmitter: this.pipeline.eventEmitter,
      childContext: { ...this.childContext, ...bound },
    });
  }

  /**
   * Return a fluent batch builder for atomic flushing.
   * @returns {LogBatcher}
   */
  batch() {
    return new LogBatcher(this);
  }
}

export default LogChannel;
