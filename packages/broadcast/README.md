# `@ecfjs/broadcast`

Real-time Event Broadcasting Subsystem for ECF (Enterprise Core Framework).

## Features

- **Multi-Driver Engine**: Memory, Redis, Pusher, Ably, Socket.IO, Null.
- **Dynamic Plugin Registry**: Register custom drivers via `Broadcast.extend()`.
- **Channel Routing**: Public, Private, and Presence channels with pattern compilation (`orders.{id}`).
- **Security & Authorization**: HMAC, JWT token verification, presence authentication, origin validation, rate-limiting.
- **Middleware Pipeline**: Lifecycle steps (`Validate`, `Authorize`, `Serialize`, `Encrypt`, `Compress`, `Publish`, `Observe`).
- **Presence Repositories**: Cluster-ready `MemoryPresenceRepository` & `RedisPresenceRepository`.
- **Queue Integration**: Automatic queue routing for `ShouldBroadcast` vs sync execution for `ShouldBroadcastNow`.
- **Notification Driver**: Native `broadcast` channel driver for `@ecfjs/notifications`.
- **Testing Fake**: Rich assertions with `Broadcast.fake()`.
- **DevTools Panel**: Horizon-style metrics for connections, channels, messages, and latency.

## Usage

```javascript
import { Broadcast, PrivateChannel, ShouldBroadcast } from "@ecfjs/broadcast";

// Authorization Rule
Broadcast.channel("orders.{id}", (user, id) => {
  return user.id === id;
});

// Event Class
class OrderCreated implements ShouldBroadcast {
  constructor(public order) {}

  broadcastOn() {
    return [new PrivateChannel(`orders.${this.order.id}`)];
  }
}

// Broadcasting
await Broadcast.to("chat.room1").emit("UserMessage", { text: "Hello!" });
```
