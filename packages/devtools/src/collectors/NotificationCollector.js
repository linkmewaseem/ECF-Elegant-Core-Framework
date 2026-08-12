export class NotificationCollector {
  collectSent(requestRecord, notificationName, channel, recipient, durationMs = 0) {
    if (!requestRecord) return;
    const at = Date.now() - (requestRecord.startedAt ?? Date.now());
    const recipientStr = typeof recipient === 'object' ? (recipient.email || recipient.id || recipient.name || JSON.stringify(recipient)) : String(recipient || '');

    const timelineItem = {
      event: `Notification Sent: ${notificationName} (${channel})`,
      category: 'notifications',
      at,
      status: 'SUCCESS',
      data: { notification: notificationName, channel, recipient: recipientStr, durationMs }
    };

    if (typeof requestRecord.addTimelineEntry === 'function') requestRecord.addTimelineEntry(timelineItem);
    else if (Array.isArray(requestRecord.timeline)) requestRecord.timeline.push(timelineItem);

    if (typeof requestRecord.addNotification === 'function') {
      requestRecord.addNotification({
        notification: notificationName,
        channel,
        recipient: recipientStr,
        durationMs,
        at,
      });
    } else if (requestRecord.panels?.notifications) {
      requestRecord.panels.notifications.sent = requestRecord.panels.notifications.sent || [];
      requestRecord.panels.notifications.sent.push({
        notification: notificationName,
        channel,
        recipient: recipientStr,
        durationMs,
        at,
      });
      const ch = channel ?? 'default';
      requestRecord.panels.notifications.channels = requestRecord.panels.notifications.channels || {};
      requestRecord.panels.notifications.channels[ch] = (requestRecord.panels.notifications.channels[ch] ?? 0) + 1;
    }
  }

  collectFailed(requestRecord, notificationName, channel, recipient, error) {
    if (!requestRecord) return;
    const at = Date.now() - (requestRecord.startedAt ?? Date.now());
    const recipientStr = typeof recipient === 'object' ? (recipient.email || recipient.id || recipient.name || JSON.stringify(recipient)) : String(recipient || '');

    const timelineItem = {
      event: `Notification Failed: ${notificationName} (${channel})`,
      category: 'notifications',
      at,
      status: 'ERROR',
      data: { notification: notificationName, channel, recipient: recipientStr, error: error?.message || error }
    };

    if (typeof requestRecord.addTimelineEntry === 'function') requestRecord.addTimelineEntry(timelineItem);
    else if (Array.isArray(requestRecord.timeline)) requestRecord.timeline.push(timelineItem);

    if (typeof requestRecord.addNotification === 'function') {
      requestRecord.addNotification({
        notification: notificationName,
        channel,
        recipient: recipientStr,
        error: error?.message || error,
        at,
      });
    } else if (requestRecord.panels?.notifications) {
      requestRecord.panels.notifications.sent = requestRecord.panels.notifications.sent || [];
      requestRecord.panels.notifications.sent.push({
        notification: notificationName,
        channel,
        recipient: recipientStr,
        error: error?.message || error,
        at,
      });
    }
  }
}

export default NotificationCollector;
