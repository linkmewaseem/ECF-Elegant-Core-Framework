# `@ecf/core` — IoC Container & Application Foundation

`@ecf/core` is the foundational IoC container and application bootstrapper for the ECF (Elegant Core Framework) ecosystem.

[![Version](https://img.shields.io/badge/version-1.0.0--rc.1-blue.svg)](https://github.com/linkmewaseem/ECF-Elegant-Core-Framework)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](https://nodejs.org)

---

## Features

- **IoC Container** — bind factories, resolve singletons, detect circular dependencies.
- **Application** wrapper with provider-based bootstrapping lifecycle (`register()`, `boot()`).
- **ServiceProvider** base class for organized service registration and lifecycle hooks.
- **Facade** system — static proxy shortcuts to container services.
- **ConfigManager** — dot-notation configuration manager (`app.db.host`).
- **LoggerManager** — pluggable transport-based logger (`info`, `warning`, `error`, `critical`).
- **EventManager** — synchronous event bus with error isolation.
- **EnvManager** + **DotEnvLoader** — `.env` file loading and typed environment variable access.

---

## Installation

```bash
pnpm add @ecf/core
```

---

## Quick Start

```javascript
import { Application, ServiceProvider, Facade } from "@ecf/core";

// 1. Define a Service Provider
class AppServiceProvider extends ServiceProvider {
  register() {
    this.container.singleton("greeting", () => "Hello from ECF Core!");
  }

  boot() {
    const greeting = this.container.make("greeting");
    console.log(greeting);
  }
}

// 2. Instantiate and Boot Application
const app = new Application();
app.register(AppServiceProvider);
app.boot();
Facade.setApplication(app);
```

---

## Configuration

`ConfigManager` provides dot-notation configuration storage:

```javascript
import { ConfigManager } from "@ecf/core";

const config = new ConfigManager();

config.set("app.name", "ECF Enterprise");
config.set("database.host", "127.0.0.1");
config.set("database.port", 5432);

console.log(config.get("app.name")); // "ECF Enterprise"
console.log(config.get("database.port")); // 5432
console.log(config.get("missing.key", "default_value")); // "default_value"
```

---

## Examples

### 1. IoC Container & Singletons

```javascript
import { Container } from "@ecf/core";

const container = new Container();

// Transient binding (new instance on every make)
container.bind("logger", () => ({ log: (msg) => console.log(msg) }));

// Singleton binding (cached instance)
container.singleton("config", () => ({ env: "production" }));

const cfg1 = container.make("config");
const cfg2 = container.make("config");
console.log(cfg1 === cfg2); // true
```

### 2. Static Facades

```javascript
import { Application, Config, Log, Event, Env, Facade } from "@ecf/core";

const app = new Application();
app.boot();
Facade.setApplication(app);

// Config Facade
Config.set("app.name", "DemoApp");

// Log Facade
Log.info("Application booted successfully", { port: 3000 });

// Event Facade
Event.listen("user.login", (payload) => console.log("User logged in:", payload.userId));
Event.dispatch("user.login", { userId: 42 });

// Env Facade
Env.get("APP_ENV", "development");
```

---

## API Reference

### Core Classes

| Class | Description |
|---|---|
| `Container` | IoC dependency injection container |
| `Application` | Container wrapper adding provider lifecycle and bootstrapping |
| `ServiceProvider` | Abstract base class for service providers |
| `Facade` | Base proxy class for static service facades |
| `ConfigManager` | Dot-notation nested configuration manager |
| `LoggerManager` | Multi-transport log routing manager |
| `EventManager` | Synchronous event listener bus |
| `EnvManager` | Environment variable dictionary manager |

---

## Testing

Run unit tests for `@ecf/core`:

```bash
node --test
```

---

## License

[MIT](LICENSE)
