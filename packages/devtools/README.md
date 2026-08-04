# `@ecf/devtools` — Developer Debugging Platform

`@ecf/devtools` is the real-time developer debugging and telemetry dashboard for the ECF (Elegant Core Framework) ecosystem.

---

## Features

- **DevToolsManager** — central collector orchestration
- **Multi-Collector** — HTTP, Database, Cache, Queue, Mail, Events, and 10+ subsystem collectors
- **EntryStore** — in-memory request-scoped debug entry storage
- **DevTools Server** — browser-based debug dashboard
- **PerformanceCollector** — request timing and memory profiling

---

## Quick Start

```javascript
import { Application } from "@ecf/core";
import { DevToolsServiceProvider, DevTools } from "@ecf/devtools";

const app = new Application();
app.register(DevToolsServiceProvider);
app.boot();

// Collectors automatically capture HTTP, DB, and cache activity
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — package architecture

---

## License

MIT
