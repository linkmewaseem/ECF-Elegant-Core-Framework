import IBroadcastDriver from "../contracts/IBroadcastDriver.js";

export class RedisDriver extends IBroadcastDriver {
  constructor(redisClient = null, options = {}) {
    super();
    this.redisClient = redisClient;
    this.prefix = options.prefix || "ecf_broadcast:";
    this.subscribers = new Map();
  }

  async publish(channel, event, payload, metadata = {}) {
    const topic = `${this.prefix}${channel}`;
    const serialized = JSON.stringify({ event, payload, metadata, timestamp: Date.now() });

    if (this.redisClient && typeof this.redisClient.publish === "function") {
      await this.redisClient.publish(topic, serialized);
    } else {
      // Memory fallback if redis client is mock/null
      const callbacks = this.subscribers.get(topic) || [];
      for (const cb of callbacks) cb(event, payload, metadata);
    }

    return { success: true, channel: topic, event };
  }

  async subscribe(channel, callback) {
    const topic = `${this.prefix}${channel}`;
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    this.subscribers.get(topic).push(callback);

    if (this.redisClient && typeof this.redisClient.subscribe === "function") {
      await this.redisClient.subscribe(topic, (msg) => {
        const parsed = JSON.parse(msg);
        callback(parsed.event, parsed.payload, parsed.metadata);
      });
    }
    return true;
  }

  async unsubscribe(channel, callback = null) {
    const topic = `${this.prefix}${channel}`;
    if (this.subscribers.has(topic)) {
      this.subscribers.delete(topic);
    }
    return true;
  }

  async authorize(channel, socketId, options = {}) {
    return { authorized: true, channel, socketId };
  }
}

export default RedisDriver;
