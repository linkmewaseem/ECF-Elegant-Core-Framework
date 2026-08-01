import { IExporter } from '../contracts/IExporter.js';
import { RingBuffer } from '../storage/RingBuffer.js';

/**
 * MemoryExporter — stores spans, metrics, and timeline entries in in-memory RingBuffers.
 * Primary exporter used by @ecf/devtools.
 */
export class MemoryExporter extends IExporter {
  #spans;
  #metrics;
  #timeline;

  constructor({ capacity = 500 } = {}) {
    super();
    this.#spans = new RingBuffer(capacity);
    this.#metrics = new RingBuffer(capacity);
    this.#timeline = new RingBuffer(capacity);
  }

  name() { return "memory"; }

  exportSpan(span) { this.#spans.push(span.toObject()); }
  exportMetric(metric) { this.#metrics.push(metric); }
  exportTimelineEntry(entry) { this.#timeline.push(entry); }

  flush() { /* no-op for memory exporter */ }

  getSpans() { return this.#spans.toArray(); }
  getMetrics() { return this.#metrics.toArray(); }
  getTimeline() { return this.#timeline.toArray(); }

  clear() {
    this.#spans.clear();
    this.#metrics.clear();
    this.#timeline.clear();
  }
}

/**
 * ConsoleExporter — logs spans and metrics to console.
 * Useful for development environments without DevTools running.
 */
export class ConsoleExporter extends IExporter {
  name() { return "console"; }

  exportSpan(span) {
    const obj = span.toObject();
    const color = { ok: "✅", warn: "⚠️", slow: "🟠", critical: "🔴", error: "❌" }[obj.status] ?? "ℹ️";
    console.log(`[Span] ${color} ${obj.name} (${obj.category}) — ${obj.durationMs}ms`);
  }

  exportMetric({ name, type, value }) {
    console.log(`[Metric] ${type.toUpperCase()} ${name} = ${value}`);
  }

  exportTimelineEntry({ event, category, at }) {
    console.log(`[Timeline] ${event} (${category}) @ +${at}ms`);
  }

  flush() {}
}

/**
 * NullExporter — silently discards everything. Used in production or testing.
 */
export class NullExporter extends IExporter {
  name() { return "null"; }
  exportSpan() {}
  exportMetric() {}
  exportTimelineEntry() {}
  flush() {}
}

export default MemoryExporter;
