import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LogManager, LogChannel, MemoryDriver } from '../../src/index.js';

describe('LogManager Unit Tests', () => {
  it('should initialize with channel profiles and write log via default stack channel', async () => {
    const manager = new LogManager({
      default: 'memory',
      channels: {
        memory: { driver: 'memory' },
      },
    });

    const channel = manager.channel('memory');
    assert.ok(channel instanceof LogChannel);

    await manager.info('System boot complete', { env: 'production' });

    const records = channel.driver.getRecords();
    assert.strictEqual(records.length, 1);
    assert.strictEqual(records[0].level, 'info');
    assert.strictEqual(records[0].message, 'System boot complete');
    assert.strictEqual(records[0].context.env, 'production');
  });

  it('should support RFC5424 + Trace log levels', async () => {
    const manager = new LogManager({
      default: 'memory',
      channels: {
        memory: { driver: 'memory', level: 'trace' },
      },
    });
    const memoryCh = manager.channel('memory');


    await manager.emergency('System down!');
    await manager.alert('High load alert');
    await manager.critical('Database connection failure');
    await manager.error('Unhandled exception');
    await manager.warning('High memory usage warning');
    await manager.notice('Maintenance notice');
    await manager.info('User logged in');
    await manager.debug('Executing SQL query');
    await manager.trace('Entering function trace');

    const records = memoryCh.driver.getRecords();
    assert.strictEqual(records.length, 9);
    assert.deepStrictEqual(
      records.map((r) => r.level),
      ['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug', 'trace']
    );
  });

  it('should evaluate lazy context when log is recorded', async () => {
    const manager = new LogManager({ default: 'memory' });
    const memoryCh = manager.channel('memory');

    let dynamicUserId = 101;

    await manager.withContext(() => ({ userId: dynamicUserId }), async () => {
      await manager.info('Action 1');
      dynamicUserId = 202;
      await manager.info('Action 2');
    });

    const records = memoryCh.driver.getRecords();
    assert.strictEqual(records.length, 2);
    assert.strictEqual(records[0].context.userId, 101);
    assert.strictEqual(records[1].context.userId, 202);
  });

  it('should create isolated child loggers with pre-bound context', async () => {
    const manager = new LogManager({ default: 'memory' });
    const memoryCh = manager.channel('memory');

    const child = memoryCh.withContext({ requestId: 'req_12345' });

    await child.info('Child request started');
    await child.error('Child request failed');

    const records = memoryCh.driver.getRecords();
    assert.strictEqual(records.length, 2);
    assert.strictEqual(records[0].context.requestId, 'req_12345');
    assert.strictEqual(records[1].context.requestId, 'req_12345');
  });

  it('should multiplex logs using StackDriver', async () => {
    const memory1 = new MemoryDriver();
    const memory2 = new MemoryDriver();

    const manager = new LogManager();
    manager.extend('mem1', () => memory1);
    manager.extend('mem2', () => memory2);

    const stackCh = manager.stack(['mem1', 'mem2']);
    await stackCh.info('Multi-channel log test');

    assert.strictEqual(memory1.getRecords().length, 1);
    assert.strictEqual(memory2.getRecords().length, 1);
    assert.strictEqual(memory1.getRecords()[0].message, 'Multi-channel log test');
    assert.strictEqual(memory2.getRecords()[0].message, 'Multi-channel log test');
  });
});
