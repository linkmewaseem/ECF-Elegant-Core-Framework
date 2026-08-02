export class EventCollector {
  collectDispatched(requestRecord, eventName, payloadPreview = null, listenersCount = 0) {
    if (requestRecord) {
      requestRecord.addEvent({
        name: eventName,
        payload: payloadPreview,
        listenersCount,
        at: Date.now() - requestRecord.startedAt,
      });
    }
  }
}

export default EventCollector;
