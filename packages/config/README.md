# `@ecfjs/config` — Hierarchical Configuration Platform

`@ecfjs/config` is the hierarchical dot-notation configuration repository for the ECF (Elegant Core Framework) ecosystem.

---

## Features

- **ConfigRepository** — dot-notation config access (`app.db.host`)
- **EnvLoader** — environment variable overlay and `.env` integration
- **ConfigEncrypter** — encrypted config value storage
- **ConfigFacade** — static proxy via `@ecfjs/core` facade system

---

## Quick Start

```javascript
import { Application } from "@ecfjs/core";
import { ConfigServiceProvider, Config } from "@ecfjs/config";

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
