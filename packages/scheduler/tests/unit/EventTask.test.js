import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { EventTask } from '../../src/index.js';

describe('@ecfjs/scheduler — EventTask Unit Tests', () => {
  test('Fluent frequency builders', () => {
    const task = new EventTask('callback', () => {});
    task.everyFiveMinutes();
    assert.equal(task.expression(), '*/5 * * * *');

    task.dailyAt('02:00');
    assert.equal(task.expression(), '0 2 * * *');

    task.weeklyOn(1, '09:30');
    assert.equal(task.expression(), '30 9 * * 1');
  });

  test('Weekdays and weekends constraints', () => {
    const task = new EventTask('callback', () => {}).everyMinute().weekdays();

    const monday = new Date('2026-08-03T10:00:00Z'); // Monday
    const sunday = new Date('2026-08-02T10:00:00Z'); // Sunday

    assert.equal(task.isDue(monday), true);
    assert.equal(task.isDue(sunday), false);
  });

  test('when() and skip() closures', () => {
    let allow = true;
    const task = new EventTask('callback', () => {})
      .everyMinute()
      .when(() => allow)
      .skip(() => false);

    assert.equal(task.isDue(), true);

    allow = false;
    assert.equal(task.isDue(), false);
  });

  test('between() and unlessBetween() time constraints', () => {
    const task = new EventTask('callback', () => {}).everyMinute().between('09:00', '18:00');
    const inTime = new Date('2026-08-01T12:00:00');
    const outTime = new Date('2026-08-01T20:00:00');

    assert.equal(task.isDue(inTime), true);
    assert.equal(task.isDue(outTime), false);
  });

  test('before, after, onSuccess, onFailure hooks', async () => {
    let beforeFired = false;
    let afterFired = false;
    let successFired = false;

    const task = new EventTask('callback', async () => 'ok')
      .before(() => { beforeFired = true; })
      .after(() => { afterFired = true; })
      .onSuccess(() => { successFired = true; });

    await task.run();

    assert.equal(beforeFired, true);
    assert.equal(afterFired, true);
    assert.equal(successFired, true);
  });
});
