import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LogMasker, ExceptionFormatter, LogManager } from '../../src/index.js';

describe('LogMasker & ExceptionFormatter Unit Tests', () => {
  it('should recursively redact sensitive fields', () => {
    const masker = new LogMasker();
    const sensitiveObj = {
      username: 'john_doe',
      password: 'supersecretpassword',
      token: 'jwt_xyz_123',
      nested: {
        authorization: 'Bearer token_abc',
        credit_card: '4532-xxxx-xxxx-8888',
        cnic: '35202-1234567-1',
        nonSensitive: 'visible',
      },
    };

    const masked = masker.mask(sensitiveObj);

    assert.strictEqual(masked.username, 'john_doe');
    assert.strictEqual(masked.password, '********');
    assert.strictEqual(masked.token, '********');
    assert.strictEqual(masked.nested.authorization, '********');
    assert.strictEqual(masked.nested.credit_card, '********');
    assert.strictEqual(masked.nested.cnic, '********');
    assert.strictEqual(masked.nested.nonSensitive, 'visible');
  });

  it('should auto-serialize Error objects in ExceptionFormatter', () => {
    const formatter = new ExceptionFormatter();
    const err = new Error('Database connection failed');
    err.code = 'ECONNREFUSED';

    const record = {
      level: 'error',
      message: err,
      context: {},
    };

    const formatted = formatter.format(record);

    assert.strictEqual(formatted.message, 'Database connection failed');
    assert.ok(formatted.exception);
    assert.strictEqual(formatted.exception.name, 'Error');
    assert.strictEqual(formatted.exception.code, 'ECONNREFUSED');
    assert.ok(formatted.exception.stack);
  });

  it('should auto-mask sensitive data during log write via LogManager', async () => {
    const manager = new LogManager({ default: 'memory' });
    const memoryCh = manager.channel('memory');

    await manager.info('User Auth Success', {
      user: 'alice',
      password: 'mypassword123',
      api_key: 'sk_test_123456',
    });

    const records = memoryCh.driver.getRecords();
    assert.strictEqual(records.length, 1);
    assert.strictEqual(records[0].context.user, 'alice');
    assert.strictEqual(records[0].context.password, '********');
    assert.strictEqual(records[0].context.api_key, '********');
  });
});
