import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LogManager } from '../../src/index.js';

describe('LogFake Testing Assertions Unit Tests', () => {
  it('should pass testing assertions when fake is active', async () => {
    const manager = new LogManager();
    const fake = manager.fake();

    await manager.info('Payment processing completed', {
      orderId: 9988,
      status: 'PAID',
      password: 'secretpassword',
    });
    await manager.error('Payment gateway timeout', { code: 504 });

    fake.assertCount(2);
    fake.assertLogged('info', 'Payment processing completed');
    fake.assertLogged('error', (r) => r.context.code === 504);
    fake.assertLevel('info', 1);
    fake.assertLevel('error', 1);
    fake.assertContext('orderId', 9988);
    fake.assertMessage('gateway timeout');
    fake.assertMasked('password');
  });

  it('should throw assertion error when expected log is missing', async () => {
    const manager = new LogManager();
    const fake = manager.fake();

    await manager.info('User registered');

    assert.throws(() => fake.assertNothingLogged());
    assert.throws(() => fake.assertLogged('error'));
    assert.throws(() => fake.assertCount(5));
  });
});
