import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Application } from '@ecf/core';
import { EventManager, EventServiceProvider } from '@ecf/events';
import { ObservabilityManager, ObservabilityServiceProvider } from '@ecf/observability';
import { ScheduleManager, SchedulerServiceProvider, TaskStarted, TaskFinished } from '../../src/index.js';

describe('@ecf/scheduler — Integration Tests', () => {
  test('Integration with @ecf/events and @ecf/observability', async () => {
    const app = new Application();
    app.register(EventServiceProvider);
    app.register(ObservabilityServiceProvider);
    app.register(SchedulerServiceProvider);
    await app.boot();

    const events = app.make('events');
    const schedule = app.make('schedule');
    const obs = app.make('observability');

    let startedEventFired = false;
    let finishedEventFired = false;

    events.listen('TaskStarted', () => { startedEventFired = true; });
    events.listen('TaskFinished', () => { finishedEventFired = true; });

    schedule.call(() => 'result').everyMinute();

    await schedule.runDue();

    assert.equal(startedEventFired, true);
    assert.equal(finishedEventFired, true);
    assert.ok(obs.getExporters()[0].getSpans().length > 0);
  });
});
