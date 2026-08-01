import { Tracer } from '../core/Tracer.js';

/**
 * BaseHook — Base class for all domain event observability hooks.
 * Provides helper methods for starting/finishing spans and recording metrics/timeline entries.
 */
export class BaseHook {
  #metrics;
  #timeline;

  constructor({ metrics = null, timeline = null } = {}) {
    this.#metrics = metrics;
    this.#timeline = timeline;
  }

  getMetrics() { return this.#metrics; }
  getTimeline() { return this.#timeline; }

  recordMetric(type, name, value, tags = {}) {
    if (!this.#metrics) return;
    if (type === "counter") this.#metrics.increment(name, value, tags);
    else if (type === "gauge") this.#metrics.gauge(name, value, tags);
    else if (type === "histogram") this.#metrics.histogram(name, value, tags);
  }

  recordTimeline(event, data, category) {
    if (this.#timeline) {
      this.#timeline.record(event, data, category);
    }
  }

  startSpan(name, category, attributes = {}) {
    return Tracer.startSpan(name, { category, ...attributes });
  }

  finishSpan(span, finalAttributes = {}) {
    Tracer.finishSpan(span, finalAttributes);
  }
}

export default BaseHook;
