import { MemoryDriver } from '../drivers/MemoryDriver.js';
import { LogChannel } from '../LogChannel.js';
import assert from 'node:assert';

/**
 * Testing Fake for ECF Logging.
 */
export class LogFake {
  constructor(manager) {
    this.manager = manager;
    this.memoryDriver = new MemoryDriver({ capacity: 10000 });
    this.fakeChannel = new LogChannel({
      name: 'fake',
      driver: this.memoryDriver,
      level: 'trace',
    });
  }

  channel(_name = null) {
    return this.fakeChannel;
  }

  stack(_channels) {
    return this.fakeChannel;
  }

  async emergency(message, context) { return this.fakeChannel.emergency(message, context); }
  async alert(message, context) { return this.fakeChannel.alert(message, context); }
  async critical(message, context) { return this.fakeChannel.critical(message, context); }
  async error(message, context) { return this.fakeChannel.error(message, context); }
  async warning(message, context) { return this.fakeChannel.warning(message, context); }
  async notice(message, context) { return this.fakeChannel.notice(message, context); }
  async info(message, context) { return this.fakeChannel.info(message, context); }
  async debug(message, context) { return this.fakeChannel.debug(message, context); }
  async trace(message, context) { return this.fakeChannel.trace(message, context); }
  async log(level, message, context) { return this.fakeChannel.log(level, message, context); }

  getLoggedRecords() {
    return this.memoryDriver.getRecords();
  }

  assertLogged(level, callbackOrMessage = null) {
    const records = this.getLoggedRecords();
    const matches = records.filter((r) => {
      if (r.level !== level.toLowerCase()) return false;
      if (typeof callbackOrMessage === 'string') {
        return String(r.message).includes(callbackOrMessage);
      }
      if (typeof callbackOrMessage === 'function') {
        return callbackOrMessage(r);
      }
      return true;
    });

    assert.ok(
      matches.length > 0,
      `Expected log with level [${level}] and matching condition, but none was logged.`
    );
  }

  assertNothingLogged() {
    const records = this.getLoggedRecords();
    assert.strictEqual(
      records.length,
      0,
      `Expected no logs to be written, but found ${records.length} logs.`
    );
  }

  assertLevel(level, expectedCount = 1) {
    const records = this.getLoggedRecords().filter((r) => r.level === level.toLowerCase());
    assert.strictEqual(
      records.length,
      expectedCount,
      `Expected ${expectedCount} logs with level [${level}], but found ${records.length}.`
    );
  }

  assertChannel(channelName, expectedCount = 1) {
    const records = this.getLoggedRecords().filter((r) => r.channel === channelName);
    assert.strictEqual(
      records.length,
      expectedCount,
      `Expected ${expectedCount} logs for channel [${channelName}], but found ${records.length}.`
    );
  }

  assertContext(key, value) {
    const records = this.getLoggedRecords().filter((r) => r.context && r.context[key] === value);
    assert.ok(
      records.length > 0,
      `Expected log containing context [${key}: ${value}], but none was found.`
    );
  }

  assertMessage(substring) {
    const records = this.getLoggedRecords().filter((r) => String(r.message).includes(substring));
    assert.ok(
      records.length > 0,
      `Expected log containing message substring "${substring}", but none was found.`
    );
  }

  assertCount(expectedCount) {
    const records = this.getLoggedRecords();
    assert.strictEqual(
      records.length,
      expectedCount,
      `Expected total count of ${expectedCount} logs, but found ${records.length}.`
    );
  }

  assertMasked(key) {
    const records = this.getLoggedRecords().filter(
      (r) => r.context && r.context[key] === '********'
    );
    assert.ok(
      records.length > 0,
      `Expected log with context key [${key}] masked as '********', but none was found.`
    );
  }
}

export default LogFake;
