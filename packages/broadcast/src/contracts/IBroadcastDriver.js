export class IBroadcastDriver {
  async publish(channel, event, payload, metadata = {}) {
    throw new Error("Method 'publish()' must be implemented.");
  }

  async subscribe(channel, callback) {
    throw new Error("Method 'subscribe()' must be implemented.");
  }

  async unsubscribe(channel, callback = null) {
    throw new Error("Method 'unsubscribe()' must be implemented.");
  }

  async authorize(channel, socketId, options = {}) {
    throw new Error("Method 'authorize()' must be implemented.");
  }
}

export default IBroadcastDriver;
