# ADR-006: Realtime Event Broadcast Subsystem

## Status
**Accepted** (Implemented in `@ecf/broadcast`)

## Context
Enterprise web and real-time applications require pushing live state changes, alerts, and chat events from backend workflows directly to connected WebSockets and client interfaces. Prior to Milestone 24, ECF contained robust messaging foundations (`@ecf/events`, `@ecf/queue`, `@ecf/notifications`, `@ecf/scheduler`), but lacked a dedicated real-time client broadcasting layer.

## Decision
1. **Dynamic Driver Registry Plugin Architecture**:
   `@ecf/broadcast` adopts a plugin-based driver registry pattern (`Broadcast.extend(name, factory)`), making drivers decoupled from the central manager (`MemoryDriver`, `RedisDriver`, `PusherDriver`, `AblyDriver`, `SocketIODriver`, `NullDriver`).
2. **Channel Pattern Compiler & Security**:
   Channels (`PublicChannel`, `PrivateChannel`, `PresenceChannel`) utilize a compiled regex pattern matcher (`chat.{room}`) for instant route compilation. Private and Presence channels require explicit authorization callbacks (`Broadcast.channel(...)`) with HMAC and JWT verification support.
3. **Presence Repository Abstraction**:
   User presence state is decoupled via `IPresenceRepository` (`MemoryPresenceRepository`, `RedisPresenceRepository`) to support horizontally scaled multi-node clusters.
4. **Middleware Pipeline**:
   Broadcasting processes through a lifecycle pipeline (`Validate` -> `Authorize` -> `Serialize` -> `Encrypt` -> `Compress` -> `Publish` -> `Observe`).
5. **Standardized Message Envelope & Serializer**:
   Messages are wrapped in a `BroadcastMessage` envelope with `id`, `event`, `payload`, `headers`, `traceId`, `correlationId`, `timestamp`, `ttl`, `priority`, and `metadata`.
6. **Queue & Event Integration**:
   Events marked with `ShouldBroadcast` are automatically routed asynchronously via `@ecf/queue` (`BroadcastEventJob`), while events marked with `ShouldBroadcastNow` skip queues for synchronous broadcasting.

## Consequences

### Positive
- Unified, fluent API for real-time WebSocket communication across different WebSocket providers (Pusher, Ably, Socket.IO, Redis).
- Complete integration with `@ecf/events`, `@ecf/notifications`, `@ecf/queue`, `@ecf/observability`, and `@ecf/devtools`.
- Pluggable middleware, encryption, retry policies, and presence storage.

### Negative
- Distributed presence tracking requires Redis or shared state persistence in clustered environments.
