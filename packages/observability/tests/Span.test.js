import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Span, SlowThreshold } from '../src/index.js';

describe('@ecfjs/observability — Span Tests', () => {
  test('Span initialization and default properties', () => {
    const span = new Span({ name: 'db.query', category: 'database' });
    assert.equal(span.getName(), 'db.query');
    assert.equal(span.getCategory(), 'database');
    assert.equal(span.isFinished(), false);
    assert.equal(span.getStatus(), 'ok');
    assert.ok(span.getSpanId());
    assert.ok(span.getTraceId());
  });

  test('Span attributes and event accumulation', () => {
    const span = new Span({ name: 'cache.get' });
    span.addAttribute('key', 'user:123');
    span.addEvent('cache_miss', { driver: 'redis' });

    const obj = span.toObject();
    assert.equal(obj.attributes.key, 'user:123');
    assert.equal(obj.events.length, 1);
    assert.equal(obj.events[0].name, 'cache_miss');
  });

  test('Span finish and duration computation', () => {
    const span = new Span({ name: 'test.operation' });
    span.finish({ result: 'success' });

    assert.equal(span.isFinished(), true);
    assert.ok(span.getDurationMs() >= 0);
    assert.equal(span.getAttributes().result, 'success');
  });

  test('Span error recording', () => {
    const span = new Span({ name: 'failing.operation' });
    const err = new Error('Database connection failed');
    span.recordError(err);

    assert.equal(span.getStatus(), 'error');
    const obj = span.toObject();
    assert.equal(obj.error.message, 'Database connection failed');
    assert.equal(span.isSlowOrWorse(), true);
  });
});
