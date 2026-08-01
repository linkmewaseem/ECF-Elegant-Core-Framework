import { randomUUID } from 'node:crypto';
import { ISpan } from '../contracts/ISpan.js';

// Slow operation thresholds (ms)
export const SlowThreshold = {
  WARN:     100,   // yellow
  SLOW:     500,   // orange
  CRITICAL: 1000,  // red
};

/**
 * Span — a timed, named unit of work within a trace.
 *
 * Supports:
 *  - Nested parent-child relationships (parentSpanId)
 *  - Attributes (key-value metadata)
 *  - Events (named timestamped points within the span)
 *  - Status: ok | warn | slow | critical | error
 *  - Automatic slow-operation detection on finish()
 */
export class Span extends ISpan {
  #spanId;
  #traceId;
  #parentSpanId;
  #name;
  #category;
  #startTime;
  #endTime = null;
  #attributes = {};
  #events = [];
  #status = "ok";
  #error = null;
  #durationMs = null;

  constructor({ name, category = "general", traceId = null, parentSpanId = null, attributes = {} } = {}) {
    super();
    this.#spanId = randomUUID();
    this.#traceId = traceId ?? randomUUID();
    this.#parentSpanId = parentSpanId ?? null;
    this.#name = name;
    this.#category = category;
    this.#startTime = Date.now();
    this.#attributes = { ...attributes };
  }

  /** Finish the span and compute duration + slow threshold. */
  finish(attributes = {}) {
    if (this.#endTime !== null) return this; // already finished
    this.#endTime = Date.now();
    this.#durationMs = this.#endTime - this.#startTime;
    Object.assign(this.#attributes, attributes);
    this.#status = this.#computeStatus();
    return this;
  }

  #computeStatus() {
    if (this.#error) return "error";
    if (this.#durationMs >= SlowThreshold.CRITICAL) return "critical";
    if (this.#durationMs >= SlowThreshold.SLOW) return "slow";
    if (this.#durationMs >= SlowThreshold.WARN) return "warn";
    return "ok";
  }

  addAttribute(key, value) {
    this.#attributes[key] = value;
    return this;
  }

  addEvent(name, attributes = {}) {
    this.#events.push({ name, at: Date.now() - this.#startTime, attributes });
    return this;
  }

  setStatus(status) {
    this.#status = status;
    return this;
  }

  recordError(error) {
    this.#error = { message: error.message, stack: error.stack, name: error.name };
    this.#status = "error";
    return this;
  }

  isFinished() { return this.#endTime !== null; }
  isSlowOrWorse() { return ["warn", "slow", "critical", "error"].includes(this.#status); }

  getSpanId() { return this.#spanId; }
  getTraceId() { return this.#traceId; }
  getParentSpanId() { return this.#parentSpanId; }
  getName() { return this.#name; }
  getCategory() { return this.#category; }
  getDurationMs() { return this.#durationMs; }
  getStatus() { return this.#status; }
  getAttributes() { return { ...this.#attributes }; }

  toObject() {
    return {
      spanId: this.#spanId,
      traceId: this.#traceId,
      parentSpanId: this.#parentSpanId,
      name: this.#name,
      category: this.#category,
      startTime: this.#startTime,
      endTime: this.#endTime,
      durationMs: this.#durationMs,
      status: this.#status,
      attributes: this.#attributes,
      events: this.#events,
      error: this.#error,
    };
  }
}

export default Span;
