# `@ecfjs/observability` — Tracing & Metrics Platform

`@ecfjs/observability` is the distributed tracing and metrics platform for the ECF (Elegant Core Framework) ecosystem.

---

## Features

- **Tracer** — span creation and context propagation
- **Span** — hierarchical trace segments with tags and logs
- **ObservabilityManager** — driver-based telemetry orchestration
- **OpenTelemetry-compatible** export adapters

---

## Quick Start

```javascript
import { ObservabilityManager, Tracer } from "@ecfjs/observability";

const tracer = Tracer.start("http.request");
tracer.setTag("method", "GET");
tracer.setTag("path", "/api/users");
// ... handle request ...
tracer.finish();
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — package architecture

---

## License

MIT
