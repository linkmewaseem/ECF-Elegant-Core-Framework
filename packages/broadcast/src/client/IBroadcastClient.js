export class IBroadcastClient {
  connect(options = {}) {
    throw new Error("Method 'connect()' must be implemented.");
  }

  channel(name) {
    throw new Error("Method 'channel()' must be implemented.");
  }

  private(name) {
    throw new Error("Method 'private()' must be implemented.");
  }

  presence(name) {
    throw new Error("Method 'presence()' must be implemented.");
  }

  disconnect() {
    throw new Error("Method 'disconnect()' must be implemented.");
  }
}

export default IBroadcastClient;
