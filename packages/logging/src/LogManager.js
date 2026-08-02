import { ILogManager } from '@ecf/contracts';
import { LogChannel } from './LogChannel.js';
import { LogContext } from './LogContext.js';
import { MemoryDriver } from './drivers/MemoryDriver.js';
import { NullDriver } from './drivers/NullDriver.js';
import { FileDriver } from './drivers/FileDriver.js';
import { DailyDriver } from './drivers/DailyDriver.js';
import { StackDriver } from './drivers/StackDriver.js';
import { ConsoleDriver } from './drivers/ConsoleDriver.js';
import { SlackDriver } from './drivers/SlackDriver.js';
import { DiscordDriver } from './drivers/DiscordDriver.js';
import { WebhookDriver } from './drivers/WebhookDriver.js';
import { MailDriver } from './drivers/MailDriver.js';
import { ElasticDriver } from './drivers/ElasticDriver.js';
import { LokiDriver } from './drivers/LokiDriver.js';

import { JsonFormatter } from './formatters/JsonFormatter.js';
import { PrettyFormatter } from './formatters/PrettyFormatter.js';
import { ConsoleFormatter } from './formatters/ConsoleFormatter.js';
import { LineFormatter } from './formatters/LineFormatter.js';
import { LogstashFormatter } from './formatters/LogstashFormatter.js';
import { LogFake } from './testing/LogFake.js';

/**
 * LogManager — Central Manager for ECF Logging Platform.
 */
export class LogManager extends ILogManager {
  #config;
  #customDrivers = new Map();
  #channels = new Map();
  #eventEmitter = null;
  #searchDriver = null;
  #fake = null;

  constructor(config = {}) {
    super();
    this.#config = {
      default: config.default || 'stack',
      channels: config.channels || {
        stack: {
          driver: 'stack',
          channels: ['daily', 'console'],
        },
        daily: {
          driver: 'daily',
          path: './storage/logs/ecf.log',
          policy: 'daily',
          days: 14,
        },
        console: {
          driver: 'console',
        },
        memory: {
          driver: 'memory',
        },
        null: {
          driver: 'null',
        },
      },
      sampling: config.sampling || {},
      ...config,
    };
    this.#eventEmitter = config.eventEmitter || null;
    this.#searchDriver = config.searchDriver || null;
  }

  /**
   * Get specific log channel instance by name.
   * @param {string} [name]
   * @returns {LogChannel}
   */
  channel(name = null) {
    if (this.#fake) {
      return this.#fake.channel(name);
    }

    const channelName = name || this.#config.default || 'console';

    if (this.#channels.has(channelName)) {
      return this.#channels.get(channelName);
    }

    const channelInstance = this.#resolveChannel(channelName);
    this.#channels.set(channelName, channelInstance);
    return channelInstance;
  }

  /**
   * Create an inline stack channel.
   * @param {string[]} channelNames
   * @returns {LogChannel}
   */
  stack(channelNames) {
    if (this.#fake) {
      return this.#fake.stack(channelNames);
    }

    const drivers = channelNames.map((name) => this.channel(name).driver);
    const stackDriver = new StackDriver({ channels: drivers });

    return new LogChannel({
      name: `stack-[${channelNames.join(',')}]`,
      driver: stackDriver,
      level: 'debug',
      eventEmitter: this.#eventEmitter,
    });
  }

  /**
   * Register custom driver factory.
   * @param {string} name
   * @param {Function} factory
   */
  extend(name, factory) {
    this.#customDrivers.set(name, factory);
    return this;
  }

  /**
   * Use specific driver directly.
   */
  use(name) {
    return this.channel(name);
  }

  /**
   * Set execution context via AsyncLocalStorage.
   * @param {Object|Function} context
   * @param {Function} [callback]
   */
  withContext(context, callback) {
    if (typeof callback === 'function') {
      return LogContext.withContext(context, callback);
    }
    return this.channel().withContext(context);
  }

  /**
   * Sample rate shortcut.
   * @param {number} rate
   */
  sample(rate) {
    this.#config.sampling = { ...this.#config.sampling, rate };
    return this;
  }

  /**
   * Search logged records (using internal memory or @ecf/search driver).
   * @param {string} query
   * @returns {Promise<Array>}
   */
  async search(query) {
    const memoryCh = this.channel('memory');
    if (memoryCh && memoryCh.driver instanceof MemoryDriver) {
      const records = memoryCh.driver.getRecords();
      return records.filter(
        (r) =>
          String(r.message).toLowerCase().includes(query.toLowerCase()) ||
          JSON.stringify(r.context || {}).toLowerCase().includes(query.toLowerCase())
      );
    }
    return [];
  }

  /**
   * Search logged records by trace ID.
   * @param {string} traceId
   * @returns {Promise<Array>}
   */
  async searchTrace(traceId) {
    const memoryCh = this.channel('memory');
    if (memoryCh && memoryCh.driver instanceof MemoryDriver) {
      const records = memoryCh.driver.getRecords();
      return records.filter((r) => r.traceId === traceId || r.context?.traceId === traceId);
    }
    return [];
  }

  /**
   * Enable testing fake.
   * @returns {LogFake}
   */
  fake() {
    if (!this.#fake) {
      this.#fake = new LogFake(this);
    }
    return this.#fake;
  }

  // Delegate PSR-3 shortcuts to default channel
  async emergency(message, context) { return this.channel().emergency(message, context); }
  async alert(message, context) { return this.channel().alert(message, context); }
  async critical(message, context) { return this.channel().critical(message, context); }
  async error(message, context) { return this.channel().error(message, context); }
  async warning(message, context) { return this.channel().warning(message, context); }
  async notice(message, context) { return this.channel().notice(message, context); }
  async info(message, context) { return this.channel().info(message, context); }
  async debug(message, context) { return this.channel().debug(message, context); }
  async trace(message, context) { return this.channel().trace(message, context); }

  async log(level, message, context) {
    return this.channel().log(level, message, context);
  }

  /**
   * Resolve channel configuration and create LogChannel instance.
   * @param {string} name
   * @returns {LogChannel}
   */
  #resolveChannel(name) {
    const chConfig = this.#config.channels[name] || { driver: name };
    const driverType = chConfig.driver || 'console';

    let driverInstance = null;

    if (this.#customDrivers.has(driverType)) {
      driverInstance = this.#customDrivers.get(driverType)(chConfig, this);
    } else {
      driverInstance = this.#createDriver(driverType, chConfig);
    }

    const formatterInstance = this.#resolveFormatter(chConfig.formatter);

    return new LogChannel({
      name,
      driver: driverInstance,
      level: chConfig.level || 'debug',
      formatter: formatterInstance,
      samplingRules: this.#config.sampling,
      eventEmitter: this.#eventEmitter,
    });
  }

  #createDriver(driverType, options) {
    switch (driverType) {
      case 'memory':
        return new MemoryDriver(options);
      case 'null':
        return new NullDriver(options);
      case 'file':
        return new FileDriver(options);
      case 'daily':
        return new DailyDriver(options);
      case 'stack': {
        const subDrivers = (options.channels || []).map((chName) => this.channel(chName).driver);
        return new StackDriver({ ...options, channels: subDrivers });
      }
      case 'console':
        return new ConsoleDriver(options);
      case 'slack':
        return new SlackDriver(options);
      case 'discord':
        return new DiscordDriver(options);
      case 'webhook':
        return new WebhookDriver(options);
      case 'mail':
        return new MailDriver(options);
      case 'elastic':
        return new ElasticDriver(options);
      case 'loki':
        return new LokiDriver(options);
      default:
        return new ConsoleDriver(options);
    }
  }

  #resolveFormatter(formatterType) {
    if (typeof formatterType === 'object' && formatterType !== null) return formatterType;

    switch (formatterType) {
      case 'pretty':
        return new PrettyFormatter();
      case 'console':
        return new ConsoleFormatter();
      case 'line':
        return new LineFormatter();
      case 'logstash':
        return new LogstashFormatter();
      case 'json':
      default:
        return new JsonFormatter();
    }
  }
}

export default LogManager;
