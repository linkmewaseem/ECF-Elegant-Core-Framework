import { randomUUID } from 'node:crypto';

/**
 * TraceContext — request-scoped correlation carrier.
 *
 * Every request gets a TraceContext holding:
 *   requestId  — unique per HTTP request
 *   traceId    — OpenTelemetry-compatible distributed trace ID
 *   parentSpanId — for nested span trees
 *   userId     — authenticated user (optional)
 *   tenantId   — multi-tenant support (optional)
 *   tags       — arbitrary key-value metadata
 */
export class TraceContext {
  constructor({
    requestId = randomUUID(),
    traceId = randomUUID(),
    parentSpanId = null,
    userId = null,
    tenantId = null,
    tags = {},
    startedAt = Date.now(),
  } = {}) {
    this.requestId = requestId;
    this.traceId = traceId;
    this.parentSpanId = parentSpanId;
    this.userId = userId;
    this.tenantId = tenantId;
    this.tags = { ...tags };
    this.startedAt = startedAt;
  }

  withParentSpan(spanId) {
    return new TraceContext({ ...this, parentSpanId: spanId });
  }

  withUser(userId) {
    this.userId = userId;
    return this;
  }

  withTenant(tenantId) {
    this.tenantId = tenantId;
    return this;
  }

  tag(key, value) {
    this.tags[key] = value;
    return this;
  }

  toObject() {
    return {
      requestId: this.requestId,
      traceId: this.traceId,
      parentSpanId: this.parentSpanId,
      userId: this.userId,
      tenantId: this.tenantId,
      tags: this.tags,
      startedAt: this.startedAt,
    };
  }
}

export default TraceContext;
