# `@ecfjs/notifications` — Unified Multi-Channel Notification Platform

`@ecfjs/notifications` is the official multi-channel notification platform for the ECF (Enterprise Core Framework) ecosystem.

---

## Features

- 📢 **Multi-Channel Delivery**: Mail, Database ORM, Broadcast, Webhooks (HMAC signed), Slack, Discord, SMS, Push, Log, Null.
- 🎛️ **Notification Middleware Pipeline**: `AuditMiddleware`, `RateLimitMiddleware`, `DeduplicateMiddleware`.
- 🗄️ **Database Notifications ORM**: Persistent `DatabaseNotificationRecord` with `markAsRead()`, `markAsUnread()`, `isRead()`, `isUnread()`.
- 🧩 **Extensible Driver Registry**: Open-Closed Principle (OCP) channel registry for third-party extensions.
- 🔒 **Idempotency & Webhook HMAC Security**: Built-in HMAC SHA-256 signatures and idempotency key headers.
- 🧪 **Testing Harness**: `Notification.fake()`, `assertSentTo()`, `assertNotSentTo()`, `assertCount()`.

---

## Quick Start

### 1. Creating a Notification

```javascript
import { Notification } from "@ecfjs/notifications";

export class OrderShippedNotification extends Notification {
  constructor(order) {
    super();
    this.order = order;
  }

  via(notifiable) {
    return ["mail", "database", "slack"];
  }

  toMail(notifiable) {
    return { subject: `Order #${this.order.id} Shipped`, html: `<p>Your order has shipped!</p>` };
  }

  toDatabase(notifiable) {
    return { orderId: this.order.id, trackingNumber: "TRK12345" };
  }

  toSlack(notifiable) {
    return { text: `Order #${this.order.id} has shipped!` };
  }
}

// Send Notification
await NotificationFacade.send(user, new OrderShippedNotification(order));
```

---

## License

MIT
