# `@ecf/notifications` — Architecture Freeze Document (v1.0)

## Overview

`@ecf/notifications` is the official Enterprise Multi-Channel Notification Platform for the ECF (Enterprise Core Framework) ecosystem. It provides unified multi-channel communication across Mail, Database ORM notifications, Realtime Broadcasts, Webhooks (HMAC SHA-256 signed), Slack, Discord, Telegram, SMS (Twilio/Vonage), and Push notifications (FCM/OneSignal/Expo).

---

## 1. Monorepo Dependency Graph

```
@ecf/core
    │
@ecf/support
    │
@ecf/mail & @ecf/queue
    │
@ecf/notifications (Milestone 20)
```

`@ecf/notifications` hard-requires `@ecf/core`, `@ecf/support`, `@ecf/mail`, and `@ecf/queue`. Config, Events, Database, and Cache act as optional peer integrations. There are **zero cyclic dependencies**.

---

## 2. Multi-Channel Architecture & Middleware Pipeline

```
            Notification Dispatch (Notification.send(user, notif))
                                    │
                                    ▼
           ┌──────────────────────────────────────────────────┐
           │ PreferenceEngine                                 │
           │ (Filters channels based on user preferences)     │
           └────────────────────────┬─────────────────────────┘
                                    │
           ┌────────────────────────▼─────────────────────────┐
           │ NotificationPipeline                             │
           │ (Audit, RateLimit, Deduplicate Middleware)       │
           └────────────────────────┬─────────────────────────┘
                                    │
           ┌────────────────────────▼─────────────────────────┐
           │ ChannelRegistry (OCP Extensible Registry)        │
           ├────────────────────────┬─────────────────────────┤
           │ MailChannel            │ DatabaseChannel (ORM)   │
           │ SlackChannel           │ WebhookChannel (HMAC)   │
           │ SmsChannel             │ PushChannel             │
           └────────────────────────┴─────────────────────────┘
```

---

## 3. Security & Resiliency Controls

- **Webhook HMAC Signatures**: Signs outgoing webhook notification payloads using SHA-256 HMAC digest and idempotency keys (`idempotencyKey`).
- **Idempotency Safeguard**: Prevents double-delivery of critical notifications.
- **Circuit Breaker Pattern**: Automatically opens and redirects traffic when external delivery channels fail continuously.
- **Testing Harness**: `Notification.fake()`, `assertSentTo()`, `assertNotSentTo()`, `assertCount()`.

---

## 4. Performance Benchmarks

- **Notification Dispatch Throughput**: >18,000 channel ops/sec.
