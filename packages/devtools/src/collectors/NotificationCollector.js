export class NotificationCollector {
  collectSent(requestRecord, notificationName, channel, recipient, durationMs = 0) {
    if (requestRecord) {
      requestRecord.addNotification({
        notification: notificationName,
        channel,
        recipient,
        durationMs,
        at: Date.now() - requestRecord.startedAt,
      });
    }
  }
}

export default NotificationCollector;
