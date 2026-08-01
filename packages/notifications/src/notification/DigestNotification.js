import Notification from "./Notification.js";

export class DigestNotification extends Notification {
  constructor(notifications = []) {
    super();
    this.notifications = notifications;
  }

  addNotification(notification) {
    this.notifications.push(notification);
    return this;
  }

  via() {
    return ["mail"];
  }

  toMail() {
    const count = this.notifications.length;
    return {
      subject: `Digest Summary: ${count} new notifications`,
      html: `<h1>Digest Notification (${count} items)</h1>`
    };
  }
}

export default DigestNotification;
