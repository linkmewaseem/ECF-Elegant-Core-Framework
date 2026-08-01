import crypto from "node:crypto";
import INotificationChannel from "../contracts/INotificationChannel.js";

export class WebhookChannel extends INotificationChannel {
  constructor(secretKey = "ecf-webhook-secret") {
    super();
    this.secretKey = secretKey;
  }

  name() {
    return "webhook";
  }

  async send(notifiable, notification) {
    if (typeof notification.toWebhook !== "function") return false;

    const payload = notification.toWebhook(notifiable);
    const targetUrl = typeof notifiable.routeNotificationFor === "function" ? notifiable.routeNotificationFor("webhook") : payload.url;

    const idempotencyKey = notification.idempotencyKey ? notification.idempotencyKey() : `idempotent_${Date.now()}`;
    const jsonBody = JSON.stringify(payload);
    const signature = crypto.createHmac("sha256", this.secretKey).update(jsonBody).digest("hex");

    return {
      sent: true,
      channel: "webhook",
      targetUrl,
      idempotencyKey,
      signature,
      payload
    };
  }
}

export default WebhookChannel;
