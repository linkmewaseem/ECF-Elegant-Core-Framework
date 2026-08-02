import { describe, it } from 'node:test';
import assert from 'node:assert';
import { test, TimeTravel, FakesOrchestrator } from '../../src/index.js';

describe('TimeTravel & FakesOrchestrator Unit Tests', () => {
  test('should freeze, travel, and restore time cleanly', async ({ time }) => {
    const initialNow = Date.now();
    const frozenTime = time.freeze('2030-01-01T00:00:00Z');

    assert.strictEqual(Date.now(), new Date('2030-01-01T00:00:00Z').getTime());

    time.advance(3600); // advance 1 hour
    assert.strictEqual(Date.now(), new Date('2030-01-01T01:00:00Z').getTime());

    time.restore();
    assert.ok(Date.now() >= initialNow);
  });

  test('should orchestrate subsystem fakes cleanly without duplication', async ({ fake }) => {
    fake.all();
    assert.ok(fake instanceof FakesOrchestrator);
  });
});
