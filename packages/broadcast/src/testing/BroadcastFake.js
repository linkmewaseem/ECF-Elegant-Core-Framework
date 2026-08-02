import IBroadcastDriver from "../contracts/IBroadcastDriver.js";

export class BroadcastFake extends IBroadcastDriver {
  constructor() {
    super();
    this.sentEvents = [];
    this.queuedEvents = [];
    this.driverName = "fake";
  }

  async publish(channel, event, payload, metadata = {}) {
    const record = {
      channel: typeof channel === "object" ? channel.name : String(channel),
      event,
      payload,
      metadata,
      timestamp: Date.now(),
      queued: Boolean(metadata.queued),
    };
    this.sentEvents.push(record);
    if (metadata.queued) {
      this.queuedEvents.push(record);
    }
    return { success: true, driver: "fake", record };
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

  assertSent(eventFilter, callback = null) {
    const matched = this.sentEvents.filter((item) => {
      const nameMatch = typeof eventFilter === "string" ? item.event === eventFilter : item.event === eventFilter.name;
      if (!nameMatch) return false;
      return callback ? callback(item.payload, item) : true;
    });

    if (matched.length === 0) {
      throw new Error(`Broadcast assertion failed: Expected event [${typeof eventFilter === "string" ? eventFilter : eventFilter.name}] was not sent.`);
    }
    return true;
  }

  assertNothingSent() {
    if (this.sentEvents.length > 0) {
      throw new Error(`Broadcast assertion failed: Expected no events sent, but [${this.sentEvents.length}] were sent.`);
    }
    return true;
  }

  assertSentOn(channel, eventFilter, callback = null) {
    const channelName = typeof channel === "object" ? channel.name : String(channel);
    const matched = this.sentEvents.filter((item) => {
      if (item.channel !== channelName) return false;
      const nameMatch = typeof eventFilter === "string" ? item.event === eventFilter : item.event === eventFilter.name;
      if (!nameMatch) return false;
      return callback ? callback(item.payload, item) : true;
    });

    if (matched.length === 0) {
      throw new Error(`Broadcast assertion failed: Expected event [${typeof eventFilter === "string" ? eventFilter : eventFilter.name}] on channel [${channelName}] was not sent.`);
    }
    return true;
  }

  assertBroadcasted(eventFilter) {
    return this.assertSent(eventFilter);
  }

  assertBroadcastedOn(channel, eventFilter) {
    return this.assertSentOn(channel, eventFilter);
  }

  assertBroadcastedTimes(eventFilter, times = 1) {
    const matched = this.sentEvents.filter((item) => {
      return typeof eventFilter === "string" ? item.event === eventFilter : item.event === eventFilter.name;
    });

    if (matched.length !== times) {
      throw new Error(`Broadcast assertion failed: Expected event [${eventFilter}] to be sent [${times}] times, but was sent [${matched.length}] times.`);
    }
    return true;
  }

  assertQueued(eventFilter) {
    const matched = this.queuedEvents.filter((item) => {
      return typeof eventFilter === "string" ? item.event === eventFilter : item.event === eventFilter.name;
    });
    if (matched.length === 0) {
      throw new Error(`Broadcast assertion failed: Expected event [${eventFilter}] to be queued.`);
    }
    return true;
  }

  assertNotQueued(eventFilter) {
    const matched = this.queuedEvents.filter((item) => {
      return typeof eventFilter === "string" ? item.event === eventFilter : item.event === eventFilter.name;
    });
    if (matched.length > 0) {
      throw new Error(`Broadcast assertion failed: Expected event [${eventFilter}] NOT to be queued.`);
    }
    return true;
  }

  assertChannel(channelName) {
    const matched = this.sentEvents.filter((item) => item.channel === channelName);
    if (matched.length === 0) {
      throw new Error(`Broadcast assertion failed: No events sent on channel [${channelName}].`);
    }
    return true;
  }

  assertEvent(eventName) {
    return this.assertSent(eventName);
  }

  assertPrivate(channelName) {
    const name = channelName.startsWith("private-") ? channelName : `private-${channelName}`;
    return this.assertChannel(name);
  }

  assertPresence(channelName) {
    const name = channelName.startsWith("presence-") ? channelName : `presence-${channelName}`;
    return this.assertChannel(name);
  }

  assertPayload(eventFilter, expectedPayload) {
    return this.assertSent(eventFilter, (payload) => {
      return JSON.stringify(payload) === JSON.stringify(expectedPayload);
    });
  }

  assertDriver(expectedDriver) {
    if (this.driverName !== expectedDriver && expectedDriver !== "fake") {
      throw new Error(`Broadcast assertion failed: Expected driver [${expectedDriver}], but got [${this.driverName}].`);
    }
    return true;
  }

  reset() {
    this.sentEvents = [];
    this.queuedEvents = [];
  }
}

export default BroadcastFake;
