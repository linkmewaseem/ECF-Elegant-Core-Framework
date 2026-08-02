# `@ecf/broadcast` Architecture & Design Specification

## Overview
`@ecf/broadcast` provides real-time event broadcasting, WebSockets, and pub-sub integration for ECF application pipelines.

```text
Application Event / Notification
              │
              ▼
    EventDispatcher / Queue
              │
              ▼
      BroadcastManager
              │
    ┌─────────┴─────────┐
    │ Pipeline & Hooks  │ (Validate -> Authorize -> Serialize -> Encrypt -> Compress -> Publish -> Observe)
    └─────────┬─────────┘
              ▼
       DriverRegistry ──► [ Memory | Redis | Pusher | Ably | SocketIO | Custom ]
              │
              ▼
     Connected WebSockets / Clients
```

## Performance Benchmarking Targets

| Driver | Target Throughput / Latency |
| :--- | :--- |
| **Memory Driver** | > 100,000 msgs/sec |
| **Redis Driver** | > 30,000 msgs/sec |
| **Pusher Driver** | Latency < 50ms |
| **Authorization** | < 2ms compilation & execution |

## Core Architectural Components

1. **Driver Registry Plugin Architecture**: `Broadcast.extend('custom', driverFactory)` and `Broadcast.use('driver')`.
2. **Channel Pattern Compiler**: Compiles pattern paths (`chat.{room}`) into optimized regex matchers.
3. **Middleware Pipeline**: Extensible middleware pipeline for auditing, compression, payload encryption, and rate limiting.
4. **Presence Repository**: Abstracted state manager (`IPresenceRepository`) supporting cluster-aware presence tracking.
5. **Message Envelope & Serializer**: Standardized `BroadcastMessage` with trace metadata, payload formatting, signatures, and timestamps.
6. **Queue Integration (`ShouldBroadcast` vs `ShouldBroadcastNow`)**: Synchronous or async queue worker dispatching.
