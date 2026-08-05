# `@ecfjs/core`

**IoC Container & Application Foundation for the ECF ecosystem.**

`@ecfjs/core` provides the dependency injection container, application lifecycle, service provider system, facades, and the foundational config/logger/event/env utilities that every other ECF package builds on.

[![Version](https://img.shields.io/badge/version-1.0.0--rc.1-blue.svg)](https://github.com/linkmewaseem/ECF-Elegant-Core-Framework)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](https://nodejs.org)

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Container](#container)
- [Application](#application)
- [Service Providers](#service-providers)
- [Facades](#facades)
- [ConfigManager](#configmanager)
- [LoggerManager](#loggermanager)
- [EventManager](#eventmanager)
- [Environment (.env)](#environment-env)
- [Error Types](#error-types)

---

## Installation

```bash
pnpm add @ecfjs/core
```

---

## Quick Start

```javascript
import { Application, ServiceProvider, Facade } from "@ecfjs/core";

class AppServiceProvider extends ServiceProvider {
    // register() and boot() both receive the Application instance as their
    // only argument — there is no `this.container` on ServiceProvider.
    register(app) {
        app.singleton("greeting", () => "Hello from ECF Core!");
    }

    boot(app) {
        const greeting = app.make("greeting");
        console.log(greeting);
    }
}

const app = new Application();
app.register(AppServiceProvider);
app.boot();
Facade.setApplication(app);
```

---

## Container

`Container` is the low-level dependency injection store. `Application` wraps it, but you can use `Container` directly if you don't need the provider lifecycle.

```javascript
import { Container } from "@ecfjs/core";

const container = new Container();

container.bind("logger", () => ({ log: (msg) => console.log(msg) }));
container.singleton("config", () => ({ env: "production" }));

const logger = container.make("logger");
container.has("config");    // true
container.forget("config"); // removes the binding and any cached instance
container.flush();          // clears all bindings, instances, and resolution state
```

| Method | Behavior |
|---|---|
| `bind(name, factory)` | Registers a transient binding — `factory` runs on every `make()` call |
| `singleton(name, factory)` | Registers a binding whose `factory` runs once; the result is cached |
| `make(name)` | Resolves a binding. **Throws `ContainerError`** if the binding doesn't exist — there is no default-value fallback |
| `has(name)` | Returns `true`/`false` |
| `forget(name)` | Removes a binding. Throws `ContainerError` if the binding doesn't exist |
| `flush()` | Clears all bindings, cached instances, and in-progress resolution tracking |

**Circular dependency detection:** `make()` tracks bindings currently being resolved. If a factory for `"a"` calls `container.make("b")`, and `"b"`'s factory calls back into `container.make("a")`, `Container` throws a `ContainerError` describing the full resolution chain instead of recursing infinitely.

---

## Application

`Application` extends `Container` with a service-provider lifecycle, global HTTP middleware registration, and a pluggable `listen()` entrypoint (wired up by `@ecfjs/http`'s `HttpServiceProvider`).

```javascript
import { Application, ServiceProvider } from "@ecfjs/core";

class MailProvider extends ServiceProvider {
    register(app) {
        app.singleton("mailer", () => new Mailer());
    }
    boot(app) {
        app.make("mailer").connect();
    }
}

const app = new Application();
app.register(MailProvider);
app.boot();
```

| Method | Description |
|---|---|
| `bind(name, factory)` | Delegates to the internal `Container` |
| `singleton(name, factory)` | Delegates to the internal `Container` |
| `make(name)` | Delegates to the internal `Container` |
| `has(name)` | Delegates to the internal `Container` |
| `forget(name)` | Delegates to the internal `Container` |
| `flush()` | Delegates to the internal `Container` |
| `register(ProviderClass)` | Queues a provider class. Throws `ContainerError` if `ProviderClass` doesn't extend `ServiceProvider`. Registering the same class twice is a no-op |
| `boot()` | Instantiates every registered provider and calls `register(app)` then `boot(app)` on each, in registration order |
| `use(middleware)` | Registers global HTTP middleware. Requires a `"middleware.registry"` binding — normally provided by `HttpServiceProvider` from `@ecfjs/http` |
| `listen(...args)` | Delegates to a listen handler registered via `registerListenHandler()`. Throws `ContainerError` if no handler is registered — register `HttpServiceProvider` first |
| `registerListenHandler(fn)` | Used by packages like `@ecfjs/http` to wire `app.listen(port, host, cb)` to an actual server. Application code does not normally call this directly |

> **Note:** `app.boot()` instantiates each provider with `new ProviderClass()` — no constructor arguments are passed. Anything a provider needs must come through the `app` parameter passed to `register()`/`boot()`, not through the provider's constructor.

---

## Service Providers

Every provider extends `ServiceProvider` and may implement `register(app)` and/or `boot(app)`:

```javascript
import { ServiceProvider } from "@ecfjs/core";

class CacheProvider extends ServiceProvider {
    register(app) {
        // Other providers may not be registered yet — only declare bindings here.
        app.singleton("cache", () => new Map());
    }

    boot(app) {
        // All providers are registered by this point — safe to resolve
        // bindings owned by other providers.
        const config = app.make("config");
        console.log("Cache driver:", config.get("cache.driver"));
    }
}
```

**Built-in providers shipped in `@ecfjs/core`:**

| Provider | Binding | Purpose |
|---|---|---|
| `ConfigServiceProvider` | `"config"` | Registers `ConfigManager` |
| `LoggerServiceProvider` | `"logger"` | Registers `LoggerManager` with a `ConsoleTransport` attached |
| `EventServiceProvider` | `"event"` | Registers `EventManager` |
| `EnvironmentServiceProvider` | `"env"` | Loads `.env` from `process.cwd()` and registers `EnvManager` |
| `CoreServiceProvider` | — | Bootstraps the other core providers together |
| `DatabaseServiceProvider` | `"database"` | Registers the database connection and ORM (re-exported here; primary implementation lives in `@ecfjs/database`) |

---

## Facades

Facades are static proxies over container bindings — they let you call `Config.get(...)` instead of `app.make("config").get(...)`.

```javascript
import { Config, Log, Event, Env } from "@ecfjs/core";

// Call once, immediately after app.boot()
Facade.setApplication(app);

Config.set("app.name", "ECF");
Config.get("app.name");               // "ECF"
Config.get("missing.key", "default"); // "default"

Log.info("Server started", { port: 3000 });
Log.warning("High memory usage");
Log.error("Request failed", { status: 500 });
Log.critical("Database unreachable");

Event.listen("user.created", (payload) => console.log("New user:", payload.name));
Event.dispatch("user.created", { name: "Alice" });

Env.get("DB_HOST", "localhost");
Env.has("APP_KEY");
```

**Writing a custom facade:**

```javascript
import { Facade } from "@ecfjs/core";

class Cache extends Facade {
    static accessor() {
        return "cache"; // must match a container binding name
    }
}

export default Facade.create(Cache);
```

`Facade.create()` wraps the class in a `Proxy`: any property access other than `accessor`, `getRoot`, or `setApplication` is resolved from the live container binding, and functions are automatically bound to the resolved instance.

> `Facade.setApplication(app)` must be called exactly once, after `app.boot()`. Every facade shares the same static `app` reference — calling it again on any facade subclass updates it globally.

---

## ConfigManager

Dot-notation key/value store for configuration values.

```javascript
import { ConfigManager } from "@ecfjs/core";

const config = new ConfigManager();

config.set("database.host", "localhost");
config.get("database.host");              // "localhost"
config.get("database.port", 5432);        // 5432 — default returned, key not set
config.get("database.missing.nested");    // null — default `defaultValue` is null
```

`set(path, value)` and `get(path, defaultValue = null)` both accept dot-separated paths (e.g. `"database.connections.pg.port"`) and will create/traverse intermediate objects as needed. `get()` never throws for a missing path — it returns `defaultValue` (which defaults to `null`, not `undefined`).

---

## LoggerManager

Transport-based logger. `LoggerManager` itself holds no output logic — it dispatches to whatever `Transport` instances are attached.

```javascript
import { LoggerManager, ConsoleTransport, Transport } from "@ecfjs/core";

const logger = new LoggerManager();
logger.addTransport(new ConsoleTransport());

logger.info("App started");
logger.warning("Disk space low", { free: "500MB" });
logger.error("Request failed", { status: 500 });
logger.critical("Database connection lost");
logger.debug("Query executed", { sql: "SELECT * FROM users", ms: 3 });

class FileTransport extends Transport {
    log(level, message, context = {}) {
        // write to a log file
    }
}

logger.addTransport(new FileTransport());
logger.removeTransport(existingTransportInstance);
```

Log levels, from least to most severe: `debug` → `info` → `warning` → `error` → `critical`.

---

## EventManager

Synchronous, error-isolated pub/sub.

```javascript
import { EventManager } from "@ecfjs/core";

const events = new EventManager(logger); // logger is optional, used to report listener errors

events.listen("order.placed", (payload) => console.log("Order placed:", payload.orderId));

// dispatch() returns an array of any errors thrown by listeners —
// one listener throwing does not stop the others from running.
const errors = events.dispatch("order.placed", { orderId: 42 });

events.has("order.placed");
events.forget("order.placed"); // removes all listeners for this event
events.clear();                // removes all events and listeners
```

---

## Environment (.env)

`EnvironmentServiceProvider` loads `.env` from `process.cwd()` automatically when registered and booted.

```javascript
import { EnvManager, DotEnvLoader } from "@ecfjs/core";

// Manual loading, without going through a provider
const parsed = DotEnvLoader.load("./.env"); // { APP_NAME: "ECF", ... }

const env = new EnvManager();
env.set("APP_NAME", "ECF");
env.get("APP_NAME");             // "ECF"
env.get("MISSING", "fallback");  // "fallback"
env.has("APP_NAME");             // true
env.all();                       // { APP_NAME: "ECF", ... }
env.clear();
```

---

## Error Types

`@ecfjs/core` throws typed errors so calling code can distinguish failure modes with `instanceof`:

| Error | Thrown by |
|---|---|
| `ContainerError` | `Container`/`Application` — missing bindings, circular dependencies, invalid provider classes, missing listen handler |
| `ConfigError` | `ConfigManager` — invalid (non-string or empty) config path |

---

## License

MIT