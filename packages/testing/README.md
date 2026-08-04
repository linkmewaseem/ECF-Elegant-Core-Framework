# `@ecf/testing` — Enterprise Test Platform

`@ecf/testing` is the DI-aware test runner, fakes orchestrator, and benchmark engine for the ECF (Elegant Core Framework) ecosystem.

---

## Features

- **TestRunner** — native `node:test` wrapper with DI sandbox
- **TestApplication** — isolated application instance per test
- **TestHttpClient** — HTTP integration testing without a live server
- **TestDatabase** — in-memory database factory for model tests
- **FakesOrchestrator** — unified fake registration (`Queue.fake()`, `Cache.fake()`, etc.)
- **TimeTravel** — deterministic date/time manipulation in tests
- **BenchmarkEngine** — package and ecosystem performance benchmarking
- **SnapshotTesting** — snapshot assertion utilities

---

## Quick Start

```javascript
import { describe, it, TestApplication } from "@ecf/testing";
import assert from "node:assert/strict";

describe("UserService", () => {
  it("creates a user", async () => {
    const app = await TestApplication.create();
    const result = await app.make("userService").create({ name: "Alice" });
    assert.equal(result.name, "Alice");
  });
});
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — package architecture

---

## License

MIT
