import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { ScheduleMutex } from '../../src/index.js';

describe('@ecfjs/scheduler — ScheduleMutex Unit Tests', () => {
  test('Lock acquisition, existence check, and unlock', async () => {
    const mutex = new ScheduleMutex();
    const taskName = 'command: queue:work';

    assert.equal(await mutex.exists(taskName), false);

    await mutex.lock(taskName, 5000);
    assert.equal(await mutex.exists(taskName), true);

    await mutex.unlock(taskName);
    assert.equal(await mutex.exists(taskName), false);
  });
});
