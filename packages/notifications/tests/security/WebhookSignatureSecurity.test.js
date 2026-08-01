import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import WebhookChannel from "../../src/channels/WebhookChannel.js";
import Notification from "../../src/notification/Notification.js";

class OrderWebhookNotification extends Notification {
  toWebhook() {
    return { url: "https://api.merchant.com/webhooks/order", orderId: 1001, amount: 99.99 };
  }
}

test("WebhookSignatureSecurity - generates valid HMAC SHA-256 signature and idempotency key", async () => {
  const channel = new WebhookChannel("secret-signature-key");
  const notifiable = {};
  const notification = new OrderWebhookNotification().setIdempotencyKey("idemp_1001");

  const res = await channel.send(notifiable, notification);

  assert.equal(res.sent, true);
  assert.equal(res.idempotencyKey, "idemp_1001");
  assert.ok(res.signature.length === 64);

  const expectedSignature = crypto
    .createHmac("sha256", "secret-signature-key")
    .update(JSON.stringify(res.payload))
    .digest("hex");

  assert.equal(res.signature, expectedSignature);
});
