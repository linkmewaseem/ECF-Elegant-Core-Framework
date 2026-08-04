# `@ecf/cache` — Multi-Driver Cache Platform

`@ecf/cache` is the multi-driver caching platform for the ECF (Elegant Core Framework) ecosystem.

---

## Features

- **Multi-Driver** — Memory, File, Redis, and Null drivers
- **CacheLock** — atomic lock acquisition for stampede protection
- **TaggedCache** — tag-based cache invalidation
- **CacheStampedeProtection** — thundering herd mitigation
- **CacheFacade** — static proxy via `@ecf/core` facade system

---

## Quick Start

```javascript
import { Application } from "@ecf/core";
import { CacheServiceProvider, Cache } from "@ecf/cache";

const app = new Application();
app.register(CacheServiceProvider);
app.boot();

await Cache.put("user:1", { name: "Alice" }, 3600);
const user = await Cache.get("user:1");
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — package architecture

---

## License

MIT
