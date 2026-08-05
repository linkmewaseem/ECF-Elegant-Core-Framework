import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Application } from '@ecfjs/core';
import { ScheduleManager, SchedulerServiceProvider } from '../../src/index.js';

describe('@ecfjs/scheduler — ScheduleManager Unit Tests', () => {
  test('ScheduleManager registers commands, jobs, callbacks', () => {
    const manager = new ScheduleManager();

    manager.command('queue:work').everyMinute();
    manager.call(() => 'hello').hourly();

    const tasks = manager.getTasks();
    assert.equal(tasks.length, 2);
    assert.equal(tasks[0].expression(), '* * * * *');
    assert.equal(tasks[1].expression(), '0 * * * *');
  });

  test('runDue executes due tasks', async () => {
    const manager = new ScheduleManager();
    let executed = false;

    manager.call(() => { executed = true; }).everyMinute();

    const results = await manager.runDue();
    assert.equal(executed, true);
    assert.equal(results.length, 1);
    assert.equal(results[0].status, 'success');
  });

  test('SchedulerServiceProvider registers schedule in container', async () => {
    const app = new Application();
    app.register(SchedulerServiceProvider);
    await app.boot();

    const schedule = app.make('schedule');
    assert.ok(schedule instanceof ScheduleManager);
  });
});
