import BroadcastMessage from "../messages/BroadcastMessage.js";

export class BroadcastSerializer {
  static serialize(eventOrName, payload = {}, channel = "", options = {}) {
    let eventName = typeof eventOrName === "string" ? eventOrName : eventOrName.constructor.name;
    let dataPayload = payload;

    if (typeof eventOrName === "object" && eventOrName !== null) {
      if (typeof eventOrName.broadcastAs === "function" && eventOrName.broadcastAs()) {
        eventName = eventOrName.broadcastAs();
      }
      if (typeof eventOrName.broadcastWith === "function" && eventOrName.broadcastWith()) {
        dataPayload = eventOrName.broadcastWith();
      } else {
        const { ...eventProps } = eventOrName;
        if (Object.keys(eventProps).length > 0) {
          dataPayload = eventProps;
        }
      }
    }

    return new BroadcastMessage({
      event: eventName,
      channel: typeof channel === "object" ? channel.name : String(channel),
      payload: dataPayload,
      traceId: options.traceId,
      metadata: options.metadata ? options.metadata : options,
    });
  }

  static deserialize(json) {
    const raw = typeof json === "string" ? JSON.parse(json) : json;
    return new BroadcastMessage(raw);
  }
}

export default BroadcastSerializer;
