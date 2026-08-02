import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DatabaseHook,
  CacheHook,
  QueueHook,
  MailHook,
  AuthHook,
  HttpHook,
  MetricsCollector,
  Timeline,
  MemoryExporter,
  Tracer,
} from '../src/index.js';

describe('@ecf/observability — Domain Hooks Tests', () => {
  test('DatabaseHook query lifecycle tracking', () => {
    const metrics = new MetricsCollector();
    const timeline = new Timeline();
    const exporter = new MemoryExporter();
    metrics.linkExporters([exporter]);
    timeline.linkExporters([exporter]);
    Tracer.addExporter(exporter);

    const dbHook = new DatabaseHook({ metrics, timeline });

    const span = dbHook.onQueryExecuting({ sql: 'SELECT * FROM users', connection: 'mysql' });
    dbHook.onQueryExecuted(span, { durationMs: 45, connection: 'mysql', rowsCount: 10 });

    assert.equal(metrics.getCounter('db.queries_total'), 1);
    assert.equal(exporter.getTimeline().length, 1);
    assert.equal(exporter.getSpans().length, 1);
    assert.equal(exporter.getSpans()[0].attributes.rowsCount, 10);
  });

  test('CacheHook hit/miss metrics and timeline logging', () => {
    const metrics = new MetricsCollector();
    const timeline = new Timeline();
    const exporter = new MemoryExporter();
    metrics.linkExporters([exporter]);
    timeline.linkExporters([exporter]);

    const cacheHook = new CacheHook({ metrics, timeline });
    cacheHook.onHit('user:10');
    cacheHook.onMiss('user:11');

    assert.equal(metrics.getCounter('cache.hits'), 1);
    assert.equal(metrics.getCounter('cache.misses'), 1);
    assert.equal(exporter.getTimeline().length, 2);
  });

  test('HttpHook request duration and status tracking', () => {
    const metrics = new MetricsCollector();
    const timeline = new Timeline();
    const exporter = new MemoryExporter();
    metrics.linkExporters([exporter]);
    timeline.linkExporters([exporter]);
    Tracer.addExporter(exporter);

    const httpHook = new HttpHook({ metrics, timeline });
    const span = httpHook.onRequestStarted({ method: 'GET', url: '/api/v1/products' });
    httpHook.onRequestFinished(span, { statusCode: 200 }, 75);

    assert.equal(metrics.getCounter('http.requests_total'), 1);
    assert.equal(exporter.getSpans()[0].name, 'http.GET /api/v1/products');
  });
});
