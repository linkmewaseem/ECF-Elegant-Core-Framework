import INotificationChannel from "../contracts/INotificationChannel.js";

export class SlackChannel extends INotificationChannel {
  name() {
    return "slack";
  }

  async send(notifiable, notification) {
    if (typeof notification.toSlack !== "function") return false;

    const message = notification.toSlack(notifiable);
    const webhookUrl = typeof notifiable.routeNotificationFor === "function" ? notifiable.routeNotificationFor("slack") : null;

    return { sent: true, channel: "slack", webhookUrl, message };
  }
}

export class LogChannel extends INotificationChannel {
  constructor(logger = null) {
    super();
    this.logger = logger;
  }

  name() {
    return "log";
  }

  async send(notifiable, notification) {
    if (this.logger) {
      this.logger.log(`[Notification LogChannel] Sent '${notification.constructor.name}' to notifiable.`);
    }
    return { sent: true, channel: "log" };
  }
}

export class NullChannel extends INotificationChannel {
  name() {
    return "null";
  }

  async send() {
    return { sent: true, channel: "null" };
  }
}

export default SlackChannel;
