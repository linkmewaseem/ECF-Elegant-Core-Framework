import { Str } from "@ecfjs/support";

export class EventContext {
  constructor(eventName, payload = {}, options = {}) {
    this.id = Str.uuid();
    this.name = eventName;
    this.payload = payload;
    this.timestamp = new Date().toISOString();
    this.source = options.source || "application";
    this.correlationId = options.correlationId || Str.uuid();
    this.requestId = options.requestId || null;
    this.traceId = options.traceId || Str.uuid();
    this.propagationStopped = false;
  }

  stop() {
    this.propagationStopped = true;
  }

  isPropagationStopped() {
    return this.propagationStopped;
  }
}

export default EventContext;
