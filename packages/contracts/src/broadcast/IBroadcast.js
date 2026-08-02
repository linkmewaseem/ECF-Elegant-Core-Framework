export class IBroadcastManager {
  driver(name = null) {}
  extend(name, factory) {}
  channel(pattern, callback) {}
  private(name) {}
  presence(name) {}
  to(channels) {}
  broadcast(eventOrChannels, eventName = null, payload = {}) {}
  fake() {}
}

export class IBroadcastDriver {
  publish(channel, event, payload, metadata = {}) {}
  subscribe(channel, callback) {}
  unsubscribe(channel, callback = null) {}
  authorize(channel, socketId, options = {}) {}
}

export class IPresenceRepository {
  join(channel, user) {}
  leave(channel, userId) {}
  members(channel) {}
  count(channel) {}
  exists(channel, userId) {}
}

export class IBroadcastMiddleware {
  handle(message, next) {}
}

export class IBroadcastMessage {
  getId() {}
  getEvent() {}
  getPayload() {}
  getHeaders() {}
}
