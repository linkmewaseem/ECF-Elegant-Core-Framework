import EventContext from "./EventContext.js";

export class Event {
  connection = "sync";
  queue = "default";
  delay = 0;
  tries = 3;
  timeout = 60;
  backoff = [5, 10, 30];

  constructor(payload = {}, options = {}) {
    this.context = new EventContext(this.constructor.name, payload, options);
  }

  get name() {
    return this.constructor.name;
  }

  stop() {
    this.context.stop();
  }

  isPropagationStopped() {
    return this.context.isPropagationStopped();
  }
}

export default Event;
