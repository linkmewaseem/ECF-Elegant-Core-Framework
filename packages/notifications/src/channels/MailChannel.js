import INotificationChannel from "../contracts/INotificationChannel.js";

export class MailChannel extends INotificationChannel {
  constructor(mailManager = null) {
    super();
    this.mailManager = mailManager;
  }

  name() {
    return "mail";
  }

  async send(notifiable, notification) {
    if (typeof notification.toMail !== "function") return false;

    const message = notification.toMail(notifiable);
    const recipient = typeof notifiable.routeNotificationFor === "function" ? notifiable.routeNotificationFor("mail") : null;

    if (this.mailManager && recipient) {
      return this.mailManager.to(recipient).send(message);
    }
    return { sent: true, channel: "mail", recipient };
  }
}

export default MailChannel;
