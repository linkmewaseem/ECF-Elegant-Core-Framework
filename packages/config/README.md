# `@ecf/config` — Hierarchical Configuration Platform

`@ecf/config` is the hierarchical dot-notation configuration repository for the ECF (Elegant Core Framework) ecosystem.

---

## Features

- **ConfigRepository** — dot-notation config access (`app.db.host`)
- **EnvLoader** — environment variable overlay and `.env` integration
- **ConfigEncrypter** — encrypted config value storage
- **ConfigFacade** — static proxy via `@ecf/core` facade system

---

## Quick Start

```javascript
import { Application } from "@ecf/core";
import { ConfigServiceProvider, Config } from "@ecf/config";

const app = new Application();
app.register(ConfigServiceProvider);
app.boot();

Config.set("app.name", "MyApp");
console.log(Config.get("app.name"));
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — package architecture

---

## License

MIT
