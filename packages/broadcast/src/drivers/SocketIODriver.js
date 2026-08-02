import IBroadcastDriver from "../contracts/IBroadcastDriver.js";

export class SocketIODriver extends IBroadcastDriver {
  constructor(ioServer = null) {
    super();
    this.ioServer = ioServer;
    this.emittedEvents = [];
  }

  async publish(channel, event, payload, metadata = {}) {
    const record = { channel, event, payload, metadata, timestamp: Date.now() };
    this.emittedEvents.push(record);

    if (this.ioServer && typeof this.ioServer.to === "function") {
      this.ioServer.to(channel).emit(event, payload);
    }
    return { success: true, driver: "socket.io", record };
  }

  async subscribe(channel, callback) {
    return true;
  }

  async unsubscribe(channel, callback = null) {
    return true;
  }

  async authorize(channel, socketId, options = {}) {
    return { authorized: true, socketId, channel };
  }
}

export default SocketIODriver;
