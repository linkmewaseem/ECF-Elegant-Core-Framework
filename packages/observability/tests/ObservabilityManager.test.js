import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Application } from '@ecfjs/core';
import {
  ObservabilityManager,
  ObservabilityServiceProvider,
  MemoryExporter,
} from '../src/index.js';

describe('@ecfjs/observability — ObservabilityManager & ServiceProvider Tests', () => {
  test('ObservabilityManager subsystem integration and domain hook lookup', () => {
    const manager = new ObservabilityManager({ defaultExporter: true });
    assert.ok(manager.metrics);
    assert.ok(manager.timeline);
    assert.ok(manager.tracer);

    const dbHook = manager.getHook('db');
    assert.ok(dbHook);

    const spansBefore = manager.getExporters()[0].getSpans().length;
    const span = manager.startSpan('manager.test');
    manager.finishSpan(span);

    const spansAfter = manager.getExporters()[0].getSpans().length;
    assert.equal(spansAfter, spansBefore + 1);
  });

  test('ObservabilityServiceProvider IoC container registration', () => {
    const app = new Application();
    app.register(ObservabilityServiceProvider);
    app.boot();

    const obs = app.make('observability');
    const tracer = app.make('tracer');
    const metrics = app.make('metrics');
    const timeline = app.make('timeline');

    assert.ok(obs instanceof ObservabilityManager);
    assert.equal(tracer, obs.tracer);
    assert.equal(metrics, obs.metrics);
    assert.equal(timeline, obs.timeline);
  });
});
