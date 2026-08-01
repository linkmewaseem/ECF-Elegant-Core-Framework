import { Tracer } from './Tracer.js';

/**
 * MetricsCollector — counter, gauge, and histogram collection.
 *
 * API:
 *   Metrics.increment("queue.jobs.dispatched")
 *   Metrics.increment("queue.jobs.failed", 1, { queue: "default" })
 *   Metrics.gauge("cache.memory_bytes", 4096)
 *   Metrics.histogram("http.response_time_ms", 87)
 *   Metrics.getAll()
 *   Metrics.reset()
 */
export class MetricsCollector {
  #counters = new Map();
  #gauges = new Map();
  #histograms = new Map();
  #exporters = [];

  // Link to Tracer exporters so metrics are pushed through the same pipeline
  linkExporters(exporters) {
    this.#exporters = exporters;
    return this;
  }

  // ─── Counter ─────────────────────────────────────────────────────────────

  increment(name, value = 1, tags = {}) {
    const current = this.#counters.get(name) ?? 0;
    this.#counters.set(name, current + value);
    this.#emit("counter", name, current + value, tags);
    return this;
  }

  decrement(name, value = 1, tags = {}) {
    return this.increment(name, -value, tags);
  }

  getCounter(name) { return this.#counters.get(name) ?? 0; }

  // ─── Gauge ────────────────────────────────────────────────────────────────

  gauge(name, value, tags = {}) {
    this.#gauges.set(name, value);
    this.#emit("gauge", name, value, tags);
    return this;
  }

  getGauge(name) { return this.#gauges.get(name) ?? null; }

  // ─── Histogram ───────────────────────────────────────────────────────────

  histogram(name, value, tags = {}) {
    const existing = this.#histograms.get(name) ?? { values: [], sum: 0, count: 0, min: Infinity, max: -Infinity };
    existing.values.push(value);
    existing.sum += value;
    existing.count++;
    existing.min = Math.min(existing.min, value);
    existing.max = Math.max(existing.max, value);
    this.#histograms.set(name, existing);
    this.#emit("histogram", name, value, tags);
    return this;
  }

  getHistogram(name) {
    const h = this.#histograms.get(name);
    if (!h) return null;
    const avg = h.count > 0 ? h.sum / h.count : 0;
    const sorted = [...h.values].sort((a, b) => a - b);
    const p50 = this.#percentile(sorted, 0.50);
    const p95 = this.#percentile(sorted, 0.95);
    const p99 = this.#percentile(sorted, 0.99);
    return { ...h, avg, p50, p95, p99 };
  }

  #percentile(sorted, p) {
    if (sorted.length === 0) return 0;
    const idx = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, idx)];
  }

  // ─── Summary ──────────────────────────────────────────────────────────────

  getAll() {
    const result = { counters: {}, gauges: {}, histograms: {} };
    for (const [k, v] of this.#counters) result.counters[k] = v;
    for (const [k, v] of this.#gauges) result.gauges[k] = v;
    for (const [k] of this.#histograms) result.histograms[k] = this.getHistogram(k);
    return result;
  }

  reset() {
    this.#counters.clear();
    this.#gauges.clear();
    this.#histograms.clear();
    return this;
  }

  #emit(type, name, value, tags) {
    const metric = { type, name, value, tags, at: Date.now() };
    for (const exporter of this.#exporters) {
      try { exporter.exportMetric(metric); } catch {}
    }
  }
}

export default MetricsCollector;
