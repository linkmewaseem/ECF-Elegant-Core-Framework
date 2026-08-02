import IBroadcastDriver from "../contracts/IBroadcastDriver.js";

export class MemoryDriver extends IBroadcastDriver {
  constructor() {
    super();
    this.subscriptions = new Map();
    this.publishedMessages = [];
  }

  async publish(channel, event, payload, metadata = {}) {
    const record = { channel, event, payload, metadata, timestamp: Date.now() };
    this.publishedMessages.push(record);

    const listeners = this.subscriptions.get(channel) || [];
    for (const callback of listeners) {
      await callback(event, payload, metadata);
    }
    return { success: true, listenersCount: listeners.length, record };
  }

  async subscribe(channel, callback) {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, []);
    }
    this.subscriptions.get(channel).push(callback);
    return true;
  }

  async unsubscribe(channel, callback = null) {
    if (!this.subscriptions.has(channel)) return false;
    if (!callback) {
      this.subscriptions.delete(channel);
      return true;
    }
    const list = this.subscriptions.get(channel).filter((cb) => cb !== callback);
    this.subscriptions.set(channel, list);
    return true;
  }

  async authorize(channel, socketId, options = {}) {
    return { authorized: true, channel, socketId };
  }

  getPublished() {
    return this.publishedMessages;
  }

  clear() {
    this.publishedMessages = [];
    this.subscriptions.clear();
  }
}

export default MemoryDriver;
