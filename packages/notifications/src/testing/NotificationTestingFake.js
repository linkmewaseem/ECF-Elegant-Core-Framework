import assert from "node:assert/strict";

export class NotificationTestingFake {
  constructor() {
    this.sentNotifications = [];
  }

  async send(notifiables, notification) {
    const targets = Array.isArray(notifiables) ? notifiables : [notifiables];
    for (const notifiable of targets) {
      this.sentNotifications.push({
        notifiable,
        notification,
        sentAt: new Date()
      });
    }
    return true;
  }

  assertSentTo(notifiable, notificationClass) {
    const className = typeof notificationClass === "string" ? notificationClass : notificationClass.name;
    const found = this.sentNotifications.some(
      n => (n.notifiable === notifiable || n.notifiable.id === notifiable.id) && n.notification.constructor.name === className
    );
    assert.ok(found, `Expected notification '${className}' to be sent to notifiable, but it was not found.`);
  }

  assertNotSentTo(notifiable, notificationClass) {
    const className = typeof notificationClass === "string" ? notificationClass : notificationClass.name;
    const found = this.sentNotifications.some(
      n => (n.notifiable === notifiable || n.notifiable.id === notifiable.id) && n.notification.constructor.name === className
    );
    assert.equal(found, false, `Expected notification '${className}' NOT to be sent, but it was found.`);
  }

  assertCount(count) {
    assert.equal(this.sentNotifications.length, count, `Expected ${count} notifications, but got ${this.sentNotifications.length}.`);
  }
}

export default NotificationTestingFake;
