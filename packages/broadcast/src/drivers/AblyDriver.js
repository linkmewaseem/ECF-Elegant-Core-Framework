import IBroadcastDriver from "../contracts/IBroadcastDriver.js";

export class AblyDriver extends IBroadcastDriver {
  constructor(options = {}) {
    super();
    this.apiKey = options.apiKey || "mock_key_id:mock_key_secret";
    this.publishedEvents = [];
  }

  async publish(channel, event, payload, metadata = {}) {
    const record = { channel, event, payload, metadata, timestamp: Date.now() };
    this.publishedEvents.push(record);
    return { success: true, driver: "ably", record };
  }

  async subscribe(channel, callback) {
    return true;
  }

  async unsubscribe(channel, callback = null) {
    return true;
  }

  async authorize(channel, socketId, options = {}) {
    return { token: `ably_token_${channel}_${socketId}` };
  }
}

export default AblyDriver;
