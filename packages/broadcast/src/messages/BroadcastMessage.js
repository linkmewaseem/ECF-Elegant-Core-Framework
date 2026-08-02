import { randomUUID } from "node:crypto";

export class BroadcastMessage {
  constructor({
    id = null,
    event = "",
    channel = "",
    payload = {},
    headers = {},
    traceId = null,
    correlationId = null,
    timestamp = Date.now(),
    ttl = 3600,
    priority = "normal",
    metadata = {},
  } = {}) {
    this.id = id || `msg_${randomUUID()}`;
    this.event = event;
    this.channel = channel;
    this.payload = payload;
    this.headers = headers;
    this.traceId = traceId || `trace_${randomUUID()}`;
    this.correlationId = correlationId || this.id;
    this.timestamp = timestamp;
    this.ttl = ttl;
    this.priority = priority;
    this.metadata = metadata;
  }

  getId() {
    return this.id;
  }

  getEvent() {
    return this.event;
  }

  getChannel() {
    return this.channel;
  }

  getPayload() {
    return this.payload;
  }

  getHeaders() {
    return this.headers;
  }

  toJSON() {
    return {
      id: this.id,
      event: this.event,
      channel: this.channel,
      payload: this.payload,
      headers: this.headers,
      traceId: this.traceId,
      correlationId: this.correlationId,
      timestamp: this.timestamp,
      ttl: this.ttl,
      priority: this.priority,
      metadata: this.metadata,
    };
  }
}

export default BroadcastMessage;
