import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Timeline, MemoryExporter, Tracer, TraceContext } from '../src/index.js';

describe('@ecfjs/observability — Timeline Tests', () => {
  test('Record timeline events and forward to exporter', () => {
    const timeline = new Timeline();
    const exporter = new MemoryExporter();
    timeline.linkExporters([exporter]);

    const ctx = new TraceContext({ requestId: 'req-99', traceId: 'tr-99' });
    Tracer.runWithContext(ctx, () => {
      timeline.record('db.query', { sql: 'SELECT 1', durationMs: 120 }, 'database');
    });

    const entries = exporter.getTimeline();
    assert.equal(entries.length, 1);
    assert.equal(entries[0].event, 'db.query');
    assert.equal(entries[0].category, 'database');
    assert.equal(entries[0].status, 'warn'); // >= 100ms triggers warn
    assert.equal(entries[0].requestId, 'req-99');
    assert.equal(entries[0].traceId, 'tr-99');
  });

  test('Status threshold calculation for timeline duration', () => {
    const timeline = new Timeline();
    const entryFast = timeline.record('step1', { durationMs: 20 });
    const entrySlow = timeline.record('step2', { durationMs: 600 });
    const entryCritical = timeline.record('step3', { durationMs: 1200 });

    assert.equal(entryFast.status, 'ok');
    assert.equal(entrySlow.status, 'slow');
    assert.equal(entryCritical.status, 'critical');
  });
});
