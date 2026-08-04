# `@ecf/skeleton` — Application Scaffolding

`@ecf/skeleton` is the application skeleton and integration test harness for the ECF (Elegant Core Framework) ecosystem.

---

## Features

- **SkeletonApplication** — pre-wired application bootstrap template
- **Integration Test Suite** — cross-package integration validation
- **Directory Conventions** — standard ECF app layout (`app/`, `config/`, `resources/`)

---

## Quick Start

```javascript
import { SkeletonApplication } from "@ecf/skeleton";

const app = await SkeletonApplication.create();
await app.boot();
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — package architecture

---

## License

MIT
