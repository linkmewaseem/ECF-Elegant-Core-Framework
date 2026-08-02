import IBroadcastDriver from "../contracts/IBroadcastDriver.js";

export class NullDriver extends IBroadcastDriver {
  async publish(channel, event, payload, metadata = {}) {
    return { success: true, driver: "null" };
  }

  async subscribe(channel, callback) {
    return true;
  }

  async unsubscribe(channel, callback = null) {
    return true;
  }

  async authorize(channel, socketId, options = {}) {
    return { authorized: true, channel, socketId };
  }
}

export default NullDriver;
