# `@ecf/events` — Priority Lifecycle Event Bus

`@ecf/events` is the priority-aware event dispatcher for the ECF (Elegant Core Framework) ecosystem.

---

## Features

- **EventDispatcher** — synchronous and async event dispatch
- **ListenerRegistry** — priority-ordered listener registration
- **EventSubscriber** — class-based event subscription
- **EventAutoDiscoverer** — automatic listener discovery
- **ShouldQueue** / **ShouldBroadcast** — queue and broadcast integration contracts

---

## Quick Start

```javascript
import { Application } from "@ecf/core";
import { EventServiceProvider, Event } from "@ecf/events";

const app = new Application();
app.register(EventServiceProvider);
app.boot();

Event.on("user.registered", (payload) => {
  console.log("New user:", payload.email);
});

Event.dispatch("user.registered", { email: "user@example.com" });
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — package architecture

---

## License

MIT
