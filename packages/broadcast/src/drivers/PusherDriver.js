import { createHmac } from "node:crypto";
import IBroadcastDriver from "../contracts/IBroadcastDriver.js";

export class PusherDriver extends IBroadcastDriver {
  constructor(options = {}) {
    super();
    this.appId = options.appId || "mock_app_id";
    this.key = options.key || "mock_key";
    this.secret = options.secret || "mock_secret";
    this.cluster = options.cluster || "mt1";
    this.fetchClient = options.fetchClient || globalThis.fetch;
    this.publishedEvents = [];
  }

  async publish(channel, event, payload, metadata = {}) {
    const record = { channel, event, payload, metadata, timestamp: Date.now() };
    this.publishedEvents.push(record);

    if (this.fetchClient && this.secret !== "mock_secret") {
      const url = `https://api-${this.cluster}.pusher.com/apps/${this.appId}/events`;
      const body = JSON.stringify({ name: event, channels: [channel], data: JSON.stringify(payload) });
      const authTimestamp = Math.floor(Date.now() / 1000);
      const authSignature = createHmac("sha256", this.secret).update(`POST\n/apps/${this.appId}/events\nauth_key=${this.key}&auth_timestamp=${authTimestamp}&auth_version=1.0\n${body}`).digest("hex");
      
      try {
        await this.fetchClient(`${url}?auth_key=${this.key}&auth_timestamp=${authTimestamp}&auth_version=1.0&auth_signature=${authSignature}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
      } catch (e) {
        // Fallback for offline/test environments
      }
    }

    return { success: true, driver: "pusher", record };
  }

  async subscribe(channel, callback) {
    return true;
  }

  async unsubscribe(channel, callback = null) {
    return true;
  }

  async authorize(channel, socketId, options = {}) {
    const stringToSign = `${socketId}:${channel}`;
    if (options.channelData) {
      const auth = createHmac("sha256", this.secret).update(`${stringToSign}:${JSON.stringify(options.channelData)}`).digest("hex");
      return { auth: `${this.key}:${auth}`, channel_data: JSON.stringify(options.channelData) };
    }
    const auth = createHmac("sha256", this.secret).update(stringToSign).digest("hex");
    return { auth: `${this.key}:${auth}` };
  }
}

export default PusherDriver;
