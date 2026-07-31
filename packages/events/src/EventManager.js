import EventDispatcher from "./EventDispatcher.js";


export class EventManager {
  constructor(dispatcher = new EventDispatcher()) {
    this.dispatcher = dispatcher;
    this.faked = false;
    this.dispatchedEvents = [];
    this.deferredResponseEvents = [];
    this.transactionCommitEvents = [];
    this.transactionRollbackEvents = [];
    this.inTransaction = false;
  }

  listen(eventName, listener, priority = 0) {
    this.dispatcher.listen(eventName, listener, priority);
    return this;
  }

  subscribe(SubscriberClassOrInstance) {
    let instance = typeof SubscriberClassOrInstance === "function" ? new SubscriberClassOrInstance() : SubscriberClassOrInstance;
    instance.subscribe(this.dispatcher);
    return this;
  }

  forget(eventName) {
    this.dispatcher.forget(eventName);
    return this;
  }

  async dispatch(eventOrName, payload = {}, options = {}) {
    const eventName = typeof eventOrName === "string" ? eventOrName : eventOrName.constructor.name;
    this.dispatchedEvents.push({ name: eventName, event: eventOrName, payload });

    if (this.faked) {
      return [];
    }

    if (this.inTransaction) {
      this.transactionCommitEvents.push({ eventOrName, payload, options });
      return [];
    }

    return this.dispatcher.dispatch(eventOrName, payload, options);
  }

  async dispatchAfterResponse(eventOrName, payload = {}, options = {}) {
    this.deferredResponseEvents.push({ eventOrName, payload, options });
  }

  async flushDeferredResponseEvents() {
    const events = [...this.deferredResponseEvents];
    this.deferredResponseEvents = [];
    for (const item of events) {
      await this.dispatch(item.eventOrName, item.payload, item.options);
    }
  }

  beginTransaction() {
    this.inTransaction = true;
    this.transactionCommitEvents = [];
  }

  async commitTransaction() {
    this.inTransaction = false;
    const events = [...this.transactionCommitEvents];
    this.transactionCommitEvents = [];
    for (const item of events) {
      await this.dispatcher.dispatch(item.eventOrName, item.payload, item.options);
    }
  }

  rollbackTransaction() {
    this.inTransaction = false;
    this.transactionCommitEvents = [];
  }

  until(eventOrName, payload = {}, options = {}) {
    if (this.faked) return null;
    return this.dispatcher.until(eventOrName, payload, options);
  }

  fake() {
    this.faked = true;
    this.dispatchedEvents = [];
    return this;
  }

  assertDispatched(eventClassOrName) {
    const targetName = typeof eventClassOrName === "function" ? eventClassOrName.name : eventClassOrName;
    const found = this.dispatchedEvents.some((e) => e.name === targetName);
    if (!found) {
      throw new Error(`Event [${targetName}] was NOT dispatched.`);
    }
  }

  assertNotDispatched(eventClassOrName) {
    const targetName = typeof eventClassOrName === "function" ? eventClassOrName.name : eventClassOrName;
    const found = this.dispatchedEvents.some((e) => e.name === targetName);
    if (found) {
      throw new Error(`Event [${targetName}] WAS unexpectedly dispatched.`);
    }
  }
}

export default EventManager;
