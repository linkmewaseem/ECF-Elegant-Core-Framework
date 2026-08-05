import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { MetricsCollector, MemoryExporter } from '../src/index.js';

describe('@ecfjs/observability — MetricsCollector Tests', () => {
  test('Counter increments and decrements', () => {
    const collector = new MetricsCollector();
    collector.increment('cache.hits');
    collector.increment('cache.hits', 4);
    collector.decrement('cache.hits', 2);

    assert.equal(collector.getCounter('cache.hits'), 3);
  });

  test('Gauge updates and retrieval', () => {
    const collector = new MetricsCollector();
    collector.gauge('memory.usage', 1024);
    assert.equal(collector.getGauge('memory.usage'), 1024);

    collector.gauge('memory.usage', 2048);
    assert.equal(collector.getGauge('memory.usage'), 2048);
  });

  test('Histogram percentile and stats calculations', () => {
    const collector = new MetricsCollector();
    for (let i = 1; i <= 100; i++) {
      collector.histogram('http.response_time', i);
    }

    const stats = collector.getHistogram('http.response_time');
    assert.equal(stats.count, 100);
    assert.equal(stats.min, 1);
    assert.equal(stats.max, 100);
    assert.equal(stats.avg, 50.5);
    assert.equal(stats.p50, 50);
    assert.equal(stats.p95, 95);
    assert.equal(stats.p99, 99);
  });

  test('Linking exporter receives metric events', () => {
    const collector = new MetricsCollector();
    const exporter = new MemoryExporter();
    collector.linkExporters([exporter]);

    collector.increment('jobs.processed', 1, { queue: 'default' });
    const metrics = exporter.getMetrics();
    assert.equal(metrics.length, 1);
    assert.equal(metrics[0].name, 'jobs.processed');
    assert.equal(metrics[0].type, 'counter');
  });
});
