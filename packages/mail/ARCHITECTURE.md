# `@ecfjs/mail` — Architecture Freeze Document (v1.0)

## Overview

`@ecfjs/mail` is the official Enterprise Mail & Communication Platform for the ECF (Enterprise Core Framework) ecosystem. It provides multi-transport mail delivery (SMTP, Resend, Mailgun, Memory, Log, Null, Failover, LoadBalancer), Mailable abstractions, Markdown template rendering with automatic CSS inlining, attachment storage integration, and email testing fakes.

---

## 1. Monorepo Dependency Graph

```
@ecfjs/core
    │
@ecfjs/support
    │
@ecfjs/queue
    │
@ecfjs/mail (Milestone 19)
```

`@ecfjs/mail` hard-requires `@ecfjs/core`, `@ecfjs/support`, and `@ecfjs/queue`. Config, Events, View, and Storage act as optional peer integrations. There are **zero cyclic dependencies**.

---

## 2. Architecture & Delivery Pipeline

```
       Mailable Dispatch (Mail.to(user).send(mailable) / queue())
                         │
                         ▼
        ┌──────────────────────────────────┐
        │ Envelope & Content Builder       │
        │ (HTML, Markdown, Attachments)    │
        └────────────────┬─────────────────┘
                         │
        ┌────────────────▼─────────────────┐
        │ SimpleCssInliner Engine          │
        │ (Inlines CSS rules for clients)  │
        └────────────────┬─────────────────┘
                         │
        ┌────────────────▼─────────────────┐
        │ Mail Transport Engine            │
        │ (Memory, Log, Smtp, Resend,      │
        │  Failover, LoadBalancer)         │
        └────────────────┬─────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │ Queue Integration                │
        │ (Delegates to @ecfjs/queue worker) │
        └──────────────────────────────────┘
```

---

## 3. Security Guarantees & Protections

- **Header Injection Shield**: Cleans newline characters (`\r\n`) from recipient lists, subjects, and custom headers to prevent SMTP header injection attacks.
- **Failover & Load-Balanced Resiliency**: `FailoverTransport` automatically retries delivery through backup transports when the primary transport fails. `LoadBalancedTransport` distributes traffic across multiple transports.
- **Dev Sandbox Security**: Captured emails during development are isolated in memory or rendered locally via `MailSandboxServer` without risking live SMTP dispatches.

---

## 4. Performance Benchmarks

- **MemoryTransport Mail Dispatch Throughput**: >60,000 ops/sec.
