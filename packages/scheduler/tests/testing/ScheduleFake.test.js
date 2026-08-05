import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { ScheduleFake } from '../../src/index.js';

describe('@ecfjs/scheduler — ScheduleFake Tests', () => {
  test('ScheduleFake asserts scheduled and ran tasks', async () => {
    const fake = new ScheduleFake();
    fake.call(() => 'fake task', [], 'test-task').everyMinute();

    assert.doesNotThrow(() => fake.assertScheduled('test-task'));

    await fake.runDue();

    assert.doesNotThrow(() => fake.assertRan('test-task'));
  });
});
