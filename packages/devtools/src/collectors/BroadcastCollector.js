export class BroadcastCollector {
  constructor() {
    this.messages = [];
    this.channels = new Map();
    this.connections = new Set();
    this.stats = {
      totalPublished: 0,
      totalBytes: 0,
      failures: 0,
    };
  }

  collectBroadcast(requestRecord, channel, event, payload, metadata = {}) {
    const payloadBytes = JSON.stringify(payload).length;
    const item = {
      id: metadata.id || `bcast_${Date.now()}_${Math.random()}`,
      channel,
      event,
      payload,
      payloadBytes,
      driver: metadata.driver || "memory",
      traceId: metadata.traceId || null,
      at: Date.now() - (requestRecord?.startedAt || Date.now()),
      timestamp: Date.now(),
    };

    this.messages.push(item);
    this.stats.totalPublished++;
    this.stats.totalBytes += payloadBytes;

    const count = this.channels.get(channel) || 0;
    this.channels.set(channel, count + 1);

    if (requestRecord && typeof requestRecord.addJob === "function") {
      requestRecord.addJob("broadcast", item);
    }
  }

  collectFailure(channel, event, error) {
    this.stats.failures++;
  }

  getSummary() {
    return {
      totalPublished: this.stats.totalPublished,
      totalBytes: this.stats.totalBytes,
      failures: this.stats.failures,
      activeChannelsCount: this.channels.size,
      recentMessages: this.messages.slice(-50),
    };
  }
}

export default BroadcastCollector;
