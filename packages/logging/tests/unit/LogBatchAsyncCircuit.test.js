import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LogManager, CircuitBreaker, RetryPolicy, WebhookDriver } from '../../src/index.js';

describe('Batching, CircuitBreaker & RetryPolicy Unit Tests', () => {
  it('should support batching multiple log records and flushing atomically', async () => {
    const manager = new LogManager({ default: 'memory' });
    const memoryCh = manager.channel('memory');

    const batch = memoryCh.batch();
    batch.add('info', 'Batch item 1', { item: 1 });
    batch.add('warning', 'Batch item 2', { item: 2 });
    batch.add('error', 'Batch item 3', { item: 3 });

    const results = await batch.flush();

    assert.strictEqual(results.length, 3);
    const records = memoryCh.driver.getRecords();
    assert.strictEqual(records.length, 3);
    assert.strictEqual(records[0].message, 'Batch item 1');
    assert.strictEqual(records[1].message, 'Batch item 2');
    assert.strictEqual(records[2].message, 'Batch item 3');
  });

  it('should trip CircuitBreaker when failures threshold is exceeded', async () => {
    const breaker = new CircuitBreaker({ maxFailures: 2, cooldownMs: 1000 });

    let attempts = 0;
    const failingAction = async () => {
      attempts++;
      throw new Error('Remote endpoint connection error');
    };

    await assert.rejects(async () => breaker.execute(failingAction));
    await assert.rejects(async () => breaker.execute(failingAction));

    assert.strictEqual(breaker.isOpen(), true);

    // Fast-fail attempt without running action
    await assert.rejects(
      async () => breaker.execute(failingAction),
      (err) => err.isCircuitOpen === true
    );

    assert.strictEqual(attempts, 2);
  });

  it('should retry failed execution with exponential backoff', async () => {
    const retry = new RetryPolicy({ maxRetries: 3, initialDelayMs: 10, backoffFactor: 2 });

    let attempts = 0;
    const transientAction = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Temporary network glitch');
      }
      return 'SUCCESS';
    };

    const result = await retry.execute(transientAction);

    assert.strictEqual(result, 'SUCCESS');
    assert.strictEqual(attempts, 3);
  });
});
