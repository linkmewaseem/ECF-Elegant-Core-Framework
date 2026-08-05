# `@ecfjs/queue` — Architecture Freeze Document (v1.0)

## Overview

`@ecfjs/queue` is the official Enterprise Asynchronous Execution Platform for the ECF (Enterprise Core Framework) ecosystem. It provides the central asynchronous backbone for Mail, Notifications, Media processing, Storage cleanup, and DevTools monitoring.

---

## 1. Monorepo Dependency Graph

```
@ecfjs/core
    │
@ecfjs/support
    │
@ecfjs/queue (Milestone 18)
    │
@ecfjs/mail (Milestone 19)
```

`@ecfjs/queue` hard-requires only `@ecfjs/core` and `@ecfjs/support`. Config, Events, Cache, and Database act as optional peer integrations. There are **zero cyclic dependencies**.

---

## 2. Architecture & Pipeline Breakdown

```
       Job Dispatch (Job.dispatch() / Queue.push())
                         │
                         ▼
        ┌──────────────────────────────────┐
        │ Secure Payload Serializer        │
        │ (v:1, SHA-256 Checksum, HMAC)    │
        └────────────────┬─────────────────┘
                         │
        ┌────────────────▼─────────────────┐
        │ Queue Driver (Sync, Memory, DB,  │
        │ Redis, Priority Queue Levels)    │
        └────────────────┬─────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │ Job Middleware Pipeline          │
        │ (WithoutOverlapping, RateLimited,│
        │  Timeout, ThrottlesExceptions)   │
        └────────────────┬─────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │ Worker Loop / WorkerSupervisor   │
        │ (Exponential Backoff, Retries,   │
        │  FailedJobRepository DLQ)        │
        └──────────────────────────────────┘
```

---

## 3. Security & Safety Controls

- **Payload Integrity & Tamper Protection (`JobSerializer`)**: Builds versioned JSON payloads (`v: 1`) signed with HMAC SHA-256 signatures and payload checksums. Throws `InvalidJobPayloadException` on tampered payloads.
- **Concurrency & Lock Safety (`WithoutOverlapping`)**: Unique job concurrency locking via cache or memory locks.
- **Rate-Limiting Protection (`RateLimited`)**: Token bucket rate limiting per key/tenant.
- **Dead-Letter Queue (`FailedJobRepository`)**: Captures failed job payloads and exception stack traces after exhausting max retries.

---

## 4. Performance Benchmarks

- **MemoryDriver Throughput**: >13,700 ops/sec (push & pop ops).
