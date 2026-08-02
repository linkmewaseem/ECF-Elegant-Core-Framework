# ADR-007: Architecture Boundaries — Queue vs Broadcast

## Status
**Accepted**

## Context
As the ECF ecosystem expanded to include both `@ecf/queue` (asynchronous background task execution) and `@ecf/broadcast` (real-time client event publishing), clear architectural guidelines were required to delineate when tasks belong in the queue versus when they belong in the broadcast engine.

## Decision

### `@ecf/queue` Responsibilities
- **Target Audience**: Internal background workers, database processing, third-party API integration, email generation, batch report generation.
- **Guarantee Model**: Heavy durability, persistence, retries with backoff, dead-letter queues (DLQ).
- **Execution Pattern**: Producer pushes job payload to queue backend (Redis, Database, Memory); isolated worker nodes pick up jobs asynchronously.

### `@ecf/broadcast` Responsibilities
- **Target Audience**: Front-end clients, browsers, mobile applications, active WebSocket connections.
- **Guarantee Model**: Low-latency real-time dispatch (`AT_MOST_ONCE`, `AT_LEAST_ONCE`).
- **Execution Pattern**: Backend engine dispatches serialized `BroadcastMessage` envelope to pub/sub brokers or WebSocket gateway drivers.

### Pipeline Integration (`ShouldBroadcast` vs `ShouldBroadcastNow`)
- **`ShouldBroadcast`**: When an domain event (e.g. `OrderCreated`) is dispatched within an HTTP controller, `@ecf/events` dispatches a `BroadcastEventJob` into `@ecf/queue`. The background worker executes the job and invokes `@ecf/broadcast`, avoiding blocking the HTTP response cycle.
- **`ShouldBroadcastNow`**: For urgent low-latency signals (e.g. live typing indicator, UI cursor position), the event bypasses `@ecf/queue` and calls `@ecf/broadcast` synchronously.

```text
HTTP Controller / Service
       │
       ├─► Event (ShouldBroadcast) ──► Queue ──► Worker ──► Broadcast ──► WebSocket ──► Client
       │
       └─► Event (ShouldBroadcastNow) ─────────────────────► Broadcast ──► WebSocket ──► Client
```

## Consequences

### Positive
- Prevents HTTP response latencies from external WebSockets or Pub/Sub network calls.
- Guarantees background retries and audit tracking for asynchronous broadcast events.
- Clear mental model for framework developers and application engineers.
