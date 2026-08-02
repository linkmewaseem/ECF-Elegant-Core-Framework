import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Tracer, MemoryExporter, TraceContext } from '../src/index.js';

describe('@ecf/observability — Tracer Tests', () => {
  let exporter;

  beforeEach(() => {
    Tracer.clearExporters();
    Tracer.enable();
    exporter = new MemoryExporter();
    Tracer.addExporter(exporter);
  });

  test('Tracer context propagation and span start/finish', () => {
    const ctx = new TraceContext({ requestId: 'req-1', traceId: 'trace-1' });

    Tracer.runWithContext(ctx, () => {
      const span = Tracer.startSpan('http.request', { category: 'http' });
      assert.equal(span.getTraceId(), 'trace-1');

      Tracer.finishSpan(span);
    });

    const spans = exporter.getSpans();
    assert.equal(spans.length, 1);
    assert.equal(spans[0].name, 'http.request');
    assert.equal(spans[0].traceId, 'trace-1');
  });

  test('Nested span parent-child relationship via ALS context', () => {
    const ctx = new TraceContext({ traceId: 'trace-2' });

    Tracer.runWithContext(ctx, () => {
      const parent = Tracer.startSpan('parentSpan', { category: 'outer' });

      const child = Tracer.startSpan('childSpan', { category: 'inner' });
      assert.equal(child.getParentSpanId(), parent.getSpanId());

      Tracer.finishSpan(child);
      Tracer.finishSpan(parent);
    });

    const spans = exporter.getSpans();
    assert.equal(spans.length, 2);
    assert.equal(spans[0].name, 'childSpan');
    assert.equal(spans[1].name, 'parentSpan');
    assert.equal(spans[0].parentSpanId, spans[1].spanId);
  });

  test('Tracer trace async wrapper', async () => {
    const result = await Tracer.trace('asyncOp', { category: 'test' }, async (span) => {
      span.addAttribute('custom', 'val');
      return 42;
    });

    assert.equal(result, 42);
    const spans = exporter.getSpans();
    assert.equal(spans.length, 1);
    assert.equal(spans[0].attributes.custom, 'val');
  });

  test('Tracer trace sync wrapper throwing error', () => {
    assert.throws(() => {
      Tracer.traceSync('syncFail', { category: 'test' }, () => {
        throw new Error('Sync fail');
      });
    });

    const spans = exporter.getSpans();
    assert.equal(spans.length, 1);
    assert.equal(spans[0].status, 'error');
    assert.equal(spans[0].error.message, 'Sync fail');
  });

  test('Disabling tracer returns no-op span', () => {
    Tracer.disable();
    const span = Tracer.startSpan('disabledSpan');
    span.addAttribute('foo', 'bar');
    span.finish();

    assert.equal(exporter.getSpans().length, 0);
  });
});
