# `@ecfjs/core`

> **The IoC Container, Application Engine, Service Provider System & Ecosystem Foundation for ECF (Elegant Core Framework).**

[![Version](https://img.shields.io/badge/version-1.0.0--rc.1-blue.svg)](https://github.com/linkmewaseem/ECF-Elegant-Core-Framework)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](https://nodejs.org)

---

## Executive Summary

`@ecfjs/core` serves as the foundational micro-kernel for the entire ECF ecosystem. It provides:
1. **Inversion of Control (IoC) Container** with transient/singleton bindings and circular dependency detection.
2. **Application Lifecycle Manager** supporting two-phase service provider orchestration (`register` -> `boot`).
3. **Static Proxy Facades** enabling expressively clean, statically accessible APIs backed by live container resolution.
4. **Configuration Manager** with dot-notation object path navigation and default fallbacks.
5. **Environment Manager & `.env` Parser** supporting quote unescaping, inline comment stripping, variable validation, and process-env syncing.
6. **Transport-based Logging System** with structured context metadata and multi-transport dispatching.
7. **Event Manager** with error-isolated subscriber execution and automatic fault logging.
8. **Exception Manager** with polymorphic error renderer/reporter resolution.
9. **View Contract Specification** for pluggable UI rendering engines.
10. **Typed Error Hierarchy** deriving from `ECFError`.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture & Design Principles](#architecture--design-principles)
- [1. IoC Container (`Container`)](#1-ioc-container-container)
  - [1.1 Transient Bindings (`bind`)](#11-transient-bindings-bind)
  - [1.2 Singleton Bindings (`singleton`)](#12-singleton-bindings-singleton)
  - [1.3 Resolving Bindings (`make`)](#13-resolving-bindings-make)
  - [1.4 Binding Inspection & Lifecycle (`has`, `forget`, `flush`)](#14-binding-inspection--lifecycle-has-forget-flush)
  - [1.5 Circular Dependency Protection](#15-circular-dependency-protection)
  - [1.6 Error Handling in Container](#16-error-handling-in-container)
- [2. Application Engine (`Application`)](#2-application-engine-application)
  - [2.1 Inheritance & Container Delegation](#21-inheritance--container-delegation)
  - [2.2 Service Provider Lifecycle (`register` & `boot`)](#22-service-provider-lifecycle-register--boot)
  - [2.3 Global Middleware Registration (`use`)](#23-global-middleware-registration-use)
  - [2.4 Batch Configuration Loader (`configure`)](#24-batch-configuration-loader-configure)
  - [2.5 HTTP Request Dispatcher (`handle`)](#25-http-request-dispatcher-handle)
  - [2.6 Server Entrypoint Delegate (`listen` & `registerListenHandler`)](#26-server-entrypoint-delegate-listen--registerlistenhandler)
- [3. Service Provider System (`ServiceProvider`)](#3-service-provider-system-serviceprovider)
  - [3.1 Two-Phase Lifecycle Architecture](#31-two-phase-lifecycle-architecture)
  - [3.2 Authoring Custom Service Providers](#32-authoring-custom-service-providers)
  - [3.3 Core Built-in Service Providers](#33-core-built-in-service-providers)
- [4. Facade Architecture (`Facade`)](#4-facade-architecture-facade)
  - [4.1 How Facades Work Under the Hood](#41-how-facades-work-under-the-hood)
  - [4.2 Global Application Binding (`setApplication`)](#42-global-application-binding-setapplication)
  - [4.3 Built-in Facades Reference](#43-built-in-facades-reference)
  - [4.4 Creating Custom Facades](#44-creating-custom-facades)
- [5. Configuration Management (`ConfigManager`)](#5-configuration-management-configmanager)
  - [5.1 Dot-Notation Path Navigation](#51-dot-notation-path-navigation)
  - [5.2 Reading & Writing Configuration Values](#52-reading--writing-configuration-values)
  - [5.3 Namespaced Loading (`load` & `loadMany`)](#53-namespaced-loading-load--loadmany)
  - [5.4 `ConfigError` Conditions](#54-configerror-conditions)
- [6. Environment Management (`EnvManager` & `DotEnvLoader`)](#6-environment-management-envmanager--dotenvloader)
  - [6.1 `.env` File Syntax & Parsing Rules](#61-env-file-syntax--parsing-rules)
  - [6.2 `DotEnvLoader` Mechanics](#62-dotenvloader-mechanics)
  - [6.3 `EnvManager` In-Memory Store](#63-envmanager-in-memory-store)
  - [6.4 Process Syncing & `EnvironmentServiceProvider`](#64-process-syncing--environmentserviceprovider)
- [7. Logging System (`LoggerManager` & Transports)](#7-logging-system-loggermanager--transports)
  - [7.1 Severity Levels](#71-severity-levels)
  - [7.2 `LoggerManager` API](#72-loggermanager-api)
  - [7.3 `ConsoleTransport` Formatting & Routing](#73-consoletransport-formatting--routing)
  - [7.4 Developing Custom Log Transports](#74-developing-custom-log-transports)
- [8. Event System (`EventManager`)](#8-event-system-eventmanager)
  - [8.1 Registering Event Listeners (`listen`)](#81-registering-event-listeners-listen)
  - [8.2 Dispatching Events (`dispatch`)](#82-dispatching-events-dispatch)
  - [8.3 Fault Isolation & Listener Error Boundaries](#83-fault-isolation--listener-error-boundaries)
  - [8.4 Event Hygiene (`has`, `forget`, `clear`)](#84-event-hygiene-has-forget-clear)
- [9. Exception Management (`ExceptionManager`)](#9-exception-management-exceptionmanager)
  - [9.1 Renderer & Reporter Mapping](#91-renderer--reporter-mapping)
  - [9.2 Polymorphic Error Resolution Algorithm](#92-polymorphic-error-resolution-algorithm)
- [10. View Contract (`ViewContract`)](#10-view-contract-viewcontract)
- [11. Typed Error Hierarchy](#11-typed-error-hierarchy)
- [12. TypeScript Type System Definitions](#12-typescript-type-system-definitions)
- [13. Complete End-to-End Usage Examples](#13-complete-end-to-end-usage-examples)
- [14. Troubleshooting & Best Practices](#14-troubleshooting--best-practices)

---

## Installation

```bash
pnpm add @ecfjs/core
# or
npm install @ecfjs/core
# or
yarn add @ecfjs/core
```

---

## Quick Start

```javascript
import {
    Application,
    ServiceProvider,
    Facade,
    Config,
    Log,
    Event,
    Env
} from "@ecfjs/core";

// 1. Define a Custom Service Provider
class AppServiceProvider extends ServiceProvider {
    register(app) {
        app.singleton("greeting", (container) => {
            const appName = container.make("config").get("app.name", "ECF App");
            return `Welcome to ${appName}!`;
        });
    }

    boot(app) {
        const greeting = app.make("greeting");
        app.make("logger").info("App Bootstrapped Successfully", { message: greeting });
    }
}

// 2. Initialize Application & Bootstrap Core
const app = new Application();

// 3. Register Providers
app.register(AppServiceProvider);

// 4. Configure Application
app.configure({
    app: {
        name: "My ECF Service",
        env: "development"
    }
});

// 5. Boot Application & Set Facade App Instance
app.boot();
Facade.setApplication(app);

// 6. Use Facades Anywhere in your code
Log.info(Config.get("app.name")); // Output: [ISO_TIMESTAMP] [INFO] My ECF Service
console.log(app.make("greeting"));  // Output: Welcome to My ECF Service!
```

---

## Architecture & Design Principles

```
  +-----------------------------------------------------------------------+
  |                              Application                              |
  |  +-----------------------------------------------------------------+  |
  |  |                            Container                            |  |
  |  |  +---------------+  +---------------+  +---------------------+  |  |
  |  |  |   bindings    |  |   instances   |  |      resolving      |  |  |
  |  |  |  (Map<str,B>) |  |  (Map<str,*>) |  |     (Set<str>)      |  |  |
  |  |  +---------------+  +---------------+  +---------------------+  |  |
  |  +-----------------------------------------------------------------+  |
  |                                                                       |
  |  +-----------------------+   +------------------------------------+  |
  |  |   providers (Set)     |   | listenHandler: (app, args) => void |  |
  |  +-----------------------+   +------------------------------------+  |
  +-----------------------------------------------------------------------+
              |                                        ^
              v                                        | (Proxy delegation)
   +---------------------+                   +-------------------+
   |  ServiceProvider    |                   |   Static Facades  |
   | (register / boot)   |                   | (Config, Log, ...) |
   +---------------------+                   +-------------------+
```

1. **Explicit Control**: No global implicit singletons or magic bindings without explicit lifecycle registration.
2. **Strict Phase Separation**: Service registration phase (`register`) MUST be side-effect free. Service invocation phase (`boot`) operates only after all dependencies are bound.
3. **Fail-Fast Error Guarantees**: Resolving invalid or non-existent bindings immediately throws descriptive typed exceptions (`ContainerError`, `ConfigError`, `EnvError`) rather than returning `undefined`.
4. **Zero Magic Proxying**: Static facades strictly delegate to the active application container instance set via `Facade.setApplication(app)`.

---

## 1. IoC Container (`Container`)

The `Container` class (`src/Container.js`) is the fundamental dependency injection engine.

### 1.1 Transient Bindings (`bind`)

Transient bindings execute the factory function **every single time** `make(name)` is invoked, returning a fresh instance.

```javascript
import { Container } from "@ecfjs/core";

const container = new Container();

container.bind("uuid", (container) => {
    return crypto.randomUUID();
});

const id1 = container.make("uuid");
const id2 = container.make("uuid");
console.log(id1 === id2); // false
```

- **Signature**: `bind(name: string, factory: (container: Container) => any): void`
- **Validation**:
  - `name` must be a non-empty string.
  - `factory` must be a function.

### 1.2 Singleton Bindings (`singleton`)

Singleton bindings run the factory function **once** during the initial `make(name)` call. The resolved result is cached in `container.instances` and returned on subsequent resolutions.

```javascript
container.singleton("database.connection", (container) => {
    const config = container.make("config");
    return new DatabaseConnection(config.get("database"));
});

const db1 = container.make("database.connection");
const db2 = container.make("database.connection");
console.log(db1 === db2); // true
```

- **Signature**: `singleton(name: string, factory: (container: Container) => any): void`

### 1.3 Resolving Bindings (`make`)

Resolves a registered binding from the container by its string key.

```javascript
const logger = container.make("logger");
```

- **Factory Signature Injection**: Every factory receives the `container` instance as its first argument:
  ```javascript
  container.bind("service", (c) => new Service(c.make("dependency")));
  ```
- **Error Behavior**: Throws `ContainerError` if the specified binding name does not exist.

### 1.4 Binding Inspection & Lifecycle (`has`, `forget`, `flush`)

```javascript
// Check if a binding exists
if (container.has("config")) {
    // ...
}

// Remove a specific binding and its cached singleton instance
container.forget("config"); // Throws ContainerError if key doesn't exist

// Reset container completely (clears bindings, cached instances, and resolution stacks)
container.flush();
```

| Method | Return Type | Description |
|---|---|---|
| `has(name)` | `boolean` | Returns `true` if the binding is registered; `false` otherwise. |
| `forget(name)` | `void` | Deletes binding metadata and cached singleton instance. Throws `ContainerError` if absent. |
| `flush()` | `void` | Purges all internal maps (`bindings`, `instances`, `resolving`). |

### 1.5 Circular Dependency Protection

The `Container` tracks bindings currently undergoing resolution in an internal `resolving` `Set`. If factory `A` attempts to resolve `B`, and factory `B` attempts to resolve `A`, `Container` interrupts execution and throws a `ContainerError` containing the full resolution trace:

```javascript
container.bind("A", (c) => c.make("B"));
container.bind("B", (c) => c.make("A"));

// Throws ContainerError: Circular dependency detected: A -> B -> A
container.make("A");
```

### 1.6 Error Handling in Container

Validation guards throw explicit `ContainerError` instances for bad parameters:

```javascript
container.bind("", () => {});        // Throws: Binding name must be a non-empty string.
container.bind("test", "not_fn");   // Throws: Factory for binding "test" must be a function.
container.make("unregistered");     // Throws: Binding with name "unregistered" does not exist.
```

---

## 2. Application Engine (`Application`)

The `Application` class (`src/Application.js`) wraps the `Container` and governs application lifecycle management, service provider orchestration, HTTP request dispatching, and middleware registration.

### 2.1 Inheritance & Container Delegation

`Application` owns a primary `Container` instance (`this.container`). All standard container operations are delegated:

- `app.bind(name, factory)`
- `app.singleton(name, factory)`
- `app.make(name)`
- `app.has(name)`
- `app.forget(name)`
- `app.flush()`

### 2.2 Service Provider Lifecycle (`register` & `boot`)

`Application` manages a `providers` `Set` containing service provider constructors.

```javascript
const app = new Application();

// 1. Queue a provider class (Deduplicated automatically)
app.register(MailServiceProvider);

// 2. Boot all queued providers in registration order
app.boot();
```

**Lifecycle execution order inside `app.boot()`:**
1. Iterates over all registered provider classes.
2. Instantiates each provider (`new ProviderClass()`).
3. Executes `provider.register(this)`.
4. Executes `provider.boot(this)`.

**Provider Class Validation:**
`register(ProviderClass)` validates that `ProviderClass` is a function and extends `ServiceProvider`. If invalid, it throws `ContainerError`:
`Service provider "Foo" must extend ServiceProvider.`

### 2.3 Global Middleware Registration (`use`)

Registers global HTTP middleware into the application middleware stack:

```javascript
app.use(async (ctx, next) => {
    console.log("Incoming request:", ctx.req.url);
    await next();
});
```

- **Requirements**: Requires a `"middleware.registry"` container binding (typically registered by `@ecfjs/http`).
- **Delegation**: Calls `app.make("middleware.registry").global(middleware)`.

### 2.4 Batch Configuration Loader (`configure`)

Loads a object map of configuration definitions into `ConfigManager`:

```javascript
app.configure({
    app: { name: "ECF Production", debug: false },
    database: { host: "127.0.0.1", port: 5432 }
});
```

- **Behavior**: Automatically initializes the `"config"` singleton if not already bound, and calls `configManager.loadMany(configMap)`.

### 2.5 HTTP Request Dispatcher (`handle`)

Dispatches raw Node.js HTTP request and response objects to the underlying HTTP kernel.

```javascript
import http from "node:http";

const server = http.createServer(async (req, res) => {
    await app.handle(req, res);
});
```

- **Delegation**: Resolves `"http.kernel"` from container and executes `kernel.handle(rawRequest, rawResponse)`.

### 2.6 Server Entrypoint Delegate (`listen` & `registerListenHandler`)

Enables framework servers (e.g., HTTP server from `@ecfjs/http`) to plug into `app.listen(...)`:

```javascript
// Framework HTTP package hooks in:
app.registerListenHandler((appInstance, args) => {
    const [port, callback] = args;
    const server = http.createServer((req, res) => appInstance.handle(req, res));
    server.listen(port, callback);
});

// User application entrypoint:
app.listen(3000, () => {
    console.log("Server listening on port 3000");
});
```

- **Error Check**: Calling `app.listen()` without registering a listen handler throws:
  `ContainerError: Application.listen() has no listen handler registered. Register a provider (e.g. HttpServiceProvider from "@ecfjs/http") before calling listen().`

---

## 3. Service Provider System (`ServiceProvider`)

The `ServiceProvider` class (`src/ServiceProvider.js`) is the modular extension contract for ECF packages.

### 3.1 Two-Phase Lifecycle Architecture

1. **`register(app)`**: Bind dependencies into the container using `app.bind()` or `app.singleton()`. **DO NOT** resolve dependencies from other providers here, as they may not be registered yet.
2. **`boot(app)`**: Perform initialization tasks (event listeners, database connections, loggers). Safe to call `app.make()` for any registered binding across the application.

### 3.2 Authoring Custom Service Providers

```javascript
import { ServiceProvider } from "@ecfjs/core";

export default class PaymentServiceProvider extends ServiceProvider {
    register(app) {
        // Register transient or singleton bindings
        app.singleton("payment.gateway", (container) => {
            const config = container.make("config").get("payment");
            return new PaymentGateway(config.apiKey);
        });
    }

    boot(app) {
        // Register event listeners or initializations
        const events = app.make("event");
        const gateway = app.make("payment.gateway");

        events.listen("checkout.completed", (payload) => {
            gateway.process(payload.amount);
        });
    }
}
```

### 3.3 Core Built-in Service Providers

| Provider Class | Binding Name | Instantiated Service | Purpose |
|---|---|---|---|
| `ConfigServiceProvider` | `"config"` | `ConfigManager` | Registers dot-notation configuration store. |
| `EnvironmentServiceProvider` | `"env"` | `EnvManager` | Parses `.env` from `process.cwd()` and populates `process.env`. |
| `LoggerServiceProvider` | `"logger"` | `LoggerManager` | Registers logger with `ConsoleTransport` attached. |
| `EventServiceProvider` | `"event"` | `EventManager` | Registers event dispatcher with logger injection. |
| `CoreServiceProvider` | `"exception.manager"` | `ExceptionManager` | Bootstraps framework exception handling registry. |
| `DatabaseServiceProvider` | `"database"`, `"db"` | `Database` | Registers database container binding aliases. |

---

## 4. Facade Architecture (`Facade`)

Facades (`src/Facade.js`) provide a static, expressive proxy interface to services residing in the IoC container.

### 4.1 How Facades Work Under the Hood

When you call `Config.get("app.name")`, `Facade` intercepts the static property call using an ES6 `Proxy`:

```
Config.get("app.name")
       │
       ▼ (Proxy static get trap)
Facade.getRoot()
       │
       ▼
app.make(Config.accessor()) -> returns ConfigManager instance
       │
       ▼
ConfigManager.get.bind(instance)("app.name")
```

1. The `Proxy` checks if the method exists directly on the static subclass constructor.
2. If not, it calls `getRoot()`, which executes `this.app.make(this.accessor())`.
3. If the resolved property is a method, it automatically binds the target instance context (`value.bind(instance)`).

### 4.2 Global Application Binding (`setApplication`)

Before invoking any facade, you **MUST** pass the initialized `Application` instance to `Facade`:

```javascript
Facade.setApplication(app);
```

> **Note:** `Facade.setApplication` sets a static reference shared across all facade subclasses.

### 4.3 Built-in Facades Reference

#### `Config` (`src/facade/Config.js`) -> Accessor: `"config"`
```javascript
import { Config } from "@ecfjs/core";

Config.set("app.name", "ECF");
const appName = Config.get("app.name", "DefaultApp");
```

#### `Log` (`src/facade/Log.js`) -> Accessor: `"logger"`
```javascript
import { Log } from "@ecfjs/core";

Log.info("User registered", { userId: 42 });
Log.error("Database connection failed", { host: "127.0.0.1" });
```

#### `Event` (`src/facade/Event.js`) -> Accessor: `"event"`
```javascript
import { Event } from "@ecfjs/core";

Event.listen("user.login", (user) => console.log(user));
Event.dispatch("user.login", { id: 1, name: "Alice" });
```

#### `Env` (`src/facade/Env.js`) -> Accessor: `"env"`
```javascript
import { Env } from "@ecfjs/core";

const port = Env.get("PORT", 3000);
```

#### `DB` (`src/facade/DB.js`) -> Accessor: `"db"`
```javascript
import { DB } from "@ecfjs/core";

// Delegates to container binding "db"
```

### 4.4 Creating Custom Facades

```javascript
import { Facade } from "@ecfjs/core";

// 1. Create Facade Subclass
class CacheFacade extends Facade {
    static accessor() {
        return "cache"; // Must match container binding key
    }
}

// 2. Export wrapped Facade Proxy
export default Facade.create(CacheFacade);
```

---

## 5. Configuration Management (`ConfigManager`)

`ConfigManager` (`src/ConfigManager.js`) provides nested key-value configuration storage.

### 5.1 Dot-Notation Path Navigation

`ConfigManager` supports infinite nesting using standard dot-separated paths (e.g. `database.connections.pg.credentials.password`).

### 5.2 Reading & Writing Configuration Values

```javascript
import { ConfigManager } from "@ecfjs/core";

const config = new ConfigManager();

// Set nested properties
config.set("database.host", "localhost");
config.set("database.port", 5432);

// Read nested properties
console.log(config.get("database.host")); // "localhost"

// Read with default fallback (default is null if unspecified)
console.log(config.get("database.ssl", false)); // false
console.log(config.get("missing.path"));        // null
```

### 5.3 Namespaced Loading (`load` & `loadMany`)

```javascript
// Load a single namespace object
config.load("app", {
    name: "ECF System",
    timezone: "UTC"
});

// Load multiple namespaces simultaneously
config.loadMany({
    database: { host: "127.0.0.1", port: 5432 },
    cache: { driver: "redis", host: "127.0.0.1" }
});

console.log(config.get("app.name"));       // "ECF System"
console.log(config.get("database.host"));  // "127.0.0.1"
```

### 5.4 `ConfigError` Conditions

`ConfigManager` validates keys and namespaces:
- Passing an empty string, non-string, or whitespace path throws `ConfigError("Config path must be a non-empty string.")`.
- Passing an invalid namespace to `load()` throws `ConfigError("Config namespace must be a non-empty string.")`.

---

## 6. Environment Management (`EnvManager` & `DotEnvLoader`)

### 6.1 `.env` File Syntax & Parsing Rules

`DotEnvLoader` (`src/env/DotEnvLoader.js`) parses standard shell environment configurations:

- **Comments**: Lines starting with `#` are ignored. Inline comments separated by space (`VAR=value # comment`) are stripped.
- **Export Prefix**: Leading `export ` statements are automatically stripped (`export PORT=3000` -> `PORT=3000`).
- **Quotes**: Double (`"..."`) and single (`'...'`) quotes are unquoted. Double-quoted strings expand `\n` into literal newlines.
- **Key Constraints**: Variable names must match `/^[A-Za-z_][A-Za-z0-9_]*$/`. Invalid keys throw `EnvError`.

```env
# Database Settings
export DB_HOST=localhost
DB_PORT=5432
DB_PASS="secret\nkey" # Inline comment
```

### 6.2 `DotEnvLoader` Mechanics

```javascript
import { DotEnvLoader } from "@ecfjs/core";

const loader = new DotEnvLoader();
const envVars = loader.load("./.env");
// Returns object: { DB_HOST: "localhost", DB_PORT: "5432", DB_PASS: "secret\nkey" }
```

### 6.3 `EnvManager` In-Memory Store

`EnvManager` (`src/env/EnvManager.js`) manages environment state in memory:

```javascript
import { EnvManager } from "@ecfjs/core";

const env = new EnvManager();

env.set("APP_ENV", "production");
console.log(env.get("APP_ENV"));           // "production"
console.log(env.get("PORT", 8080));        // 8080 (fallback)
console.log(env.has("APP_ENV"));           // true

// Get shallow copy of all environment items
const allVars = env.all();

// Clear internal store
env.clear();
```

### 6.4 Process Syncing & `EnvironmentServiceProvider`

When `EnvironmentServiceProvider` boots:
1. Checks for `.env` in `process.cwd()`.
2. Parses key-value pairs into `EnvManager`.
3. Sets key-value pairs into Node's global `process.env[key]` **only if `process.env[key]` is currently undefined**, preserving pre-existing environment variables.

---

## 7. Logging System (`LoggerManager` & Transports)

`LoggerManager` (`src/LoggerManager.js`) provides a transport-based logging facade.

### 7.1 Severity Levels

1. `debug`
2. `info`
3. `warning`
4. `error`
5. `critical`

### 7.2 `LoggerManager` API

```javascript
import { LoggerManager, ConsoleTransport } from "@ecfjs/core";

const logger = new LoggerManager();

// Transports management
const consoleTransport = new ConsoleTransport();
logger.addTransport(consoleTransport);

// Logging methods
logger.debug("Debugging query", { executionMs: 12 });
logger.info("HTTP Request", { path: "/api/users", status: 200 });
logger.warning("High memory usage", { freeMem: "128MB" });
logger.error("Database query failed", { error: "ETIMEDOUT" });
logger.critical("Fatal system failure", { exitCode: 1 });

// Detach transport
logger.removeTransport(consoleTransport);
```

### 7.3 `ConsoleTransport` Formatting & Routing

`ConsoleTransport` (`src/transports/ConsoleTransport.js`) formats logs into ISO timestamped messages and routes them to Node's `console` streams:

```
[2026-08-10T04:10:00.000Z] [INFO] HTTP Request {"path":"/api/users","status":200}
```

- `warning` level -> `console.warn()`
- `error` and `critical` levels -> `console.error()`
- `info` and `debug` levels -> `console.info()`

### 7.4 Developing Custom Log Transports

Create custom transports by extending `Transport` (`src/transports/Transport.js`):

```javascript
import { Transport } from "@ecfjs/core";

export class FileTransport extends Transport {
    constructor(filePath) {
        super();
        this.filePath = filePath;
    }

    log(level, message, context = {}) {
        const payload = JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            message,
            context
        }) + "\n";

        fs.appendFileSync(this.filePath, payload);
    }
}
```

---

## 8. Event System (`EventManager`)

`EventManager` (`src/events/EventManager.js`) manages synchronous publish-subscribe event channels.

### 8.1 Registering Event Listeners (`listen`)

```javascript
import { EventManager, LoggerManager, ConsoleTransport } from "@ecfjs/core";

const logger = new LoggerManager().addTransport(new ConsoleTransport());
const events = new EventManager(logger);

events.listen("user.registered", (user) => {
    console.log(`Sending welcome email to ${user.email}`);
});

events.listen("user.registered", (user) => {
    console.log(`Allocating storage workspace for ${user.id}`);
});
```

### 8.2 Dispatching Events (`dispatch`)

```javascript
const errors = events.dispatch("user.registered", { id: 101, email: "user@example.com" });
```

- **Return Value**: An array of error records for any listeners that threw exceptions during dispatch.

### 8.3 Fault Isolation & Listener Error Boundaries

If one listener throws an exception during `dispatch()`, execution does **NOT** break. The `EventManager`:
1. Catches the error.
2. Logs the failure to `logger.error("Listener for event ... threw an error.", { message, stack })`.
3. Appends `{ event, listener, error }` to the returned `errors` array.
4. Continues invoking all subsequent listeners.

```javascript
events.listen("order.created", () => {
    throw new Error("Payment gateway connection failed!");
});

events.listen("order.created", () => {
    console.log("This listener still executes!");
});

const errors = events.dispatch("order.created", { orderId: 42 });
console.log(errors.length); // 1
```

### 8.4 Event Hygiene (`has`, `forget`, `clear`)

```javascript
events.has("user.registered");    // Returns true if listeners exist for event
events.forget("user.registered"); // Removes all listeners for specific event
events.clear();                   // Removes all registered events and listeners
```

---

## 9. Exception Management (`ExceptionManager`)

`ExceptionManager` (`src/ExceptionManager.js`) handles error classification, rendering, and reporting.

### 9.1 Renderer & Reporter Mapping

```javascript
import { ExceptionManager } from "@ecfjs/core";

const exceptions = new ExceptionManager();

class ValidationError extends Error {}

// Register custom renderer
exceptions.render(ValidationError, (error) => {
    return { status: 422, error: error.message };
});

// Register custom reporter
exceptions.report(ValidationError, (error) => {
    Sentry.captureException(error);
});
```

### 9.2 Polymorphic Error Resolution Algorithm

`resolveRenderer(error)` and `resolveReporter(error)` evaluate registered error constructors using `error instanceof ErrorClass`. Subclass exceptions automatically resolve to base class handlers if specific handlers are absent.

```javascript
class DatabaseError extends Error {}
class ConnectionTimeoutError extends DatabaseError {}

exceptions.render(DatabaseError, () => ({ status: 500, message: "DB Error" }));

const handler = exceptions.resolveRenderer(new ConnectionTimeoutError());
// Successfully resolves the DatabaseError handler!
```

---

## 10. View Contract (`ViewContract`)

`ViewContract` (`src/ViewContract.js`) specifies the formal contract for template view rendering adapters:

```javascript
import { ViewContract } from "@ecfjs/core";

export default class HandlebarsViewAdapter extends ViewContract {
    async render(viewName, data = {}) {
        const template = await loadTemplate(viewName);
        return template(data);
    }
}
```

Calling `ViewContract.prototype.render()` directly without subclass implementation throws `ViewContractError("ViewContract.render() must be implemented.")`.

---

## 11. Typed Error Hierarchy

All framework exceptions thrown by `@ecfjs/core` derive from `ECFError` (`src/errors/ECFError.js`), which preserves clean V8 stack traces (`Error.captureStackTrace`).

```
ECFError (extends Error)
 ├── ContainerError
 ├── ConfigError
 ├── LoggerError
 ├── EventError
 ├── EnvError
 ├── ExceptionManagerError
 └── ViewContractError
```

### Exception Catching Example

```javascript
import { ContainerError, ConfigError } from "@ecfjs/core";

try {
    app.make("unknown.service");
} catch (error) {
    if (error instanceof ContainerError) {
        console.error("IoC Resolution Failure:", error.message);
    } else if (error instanceof ConfigError) {
        console.error("Configuration Fault:", error.message);
    }
}
```

---

## 12. TypeScript Type System Definitions

`@ecfjs/core` bundles full TypeScript type declarations in `src/index.d.ts`.

### Export Summary

```typescript
import {
    Container,
    Application,
    ServiceProvider,
    Facade,
    ECFError,
    ContainerError,
    ConfigError,
    LoggerError,
    EventError,
    EnvError,
    ExceptionManagerError,
    ViewContractError,
    ViewContract,
    ConfigManager,
    ConfigServiceProvider,
    Config,
    LoggerManager,
    LoggerServiceProvider,
    Log,
    Transport,
    ConsoleTransport,
    EventManager,
    EventServiceProvider,
    Event,
    EnvManager,
    DotEnvLoader,
    EnvironmentServiceProvider,
    Env,
    ExceptionManager,
    CoreServiceProvider,
    DatabaseServiceProvider,
    DB
} from "@ecfjs/core";
```

---

## 13. Complete End-to-End Usage Examples

### Full Application Bootstrapping Script

```javascript
import {
    Application,
    ServiceProvider,
    Facade,
    Config,
    Log,
    Event,
    Env,
    EnvironmentServiceProvider,
    ConfigServiceProvider,
    LoggerServiceProvider,
    EventServiceProvider,
    CoreServiceProvider
} from "@ecfjs/core";

// 1. Define Domain Service Provider
class DomainServiceProvider extends ServiceProvider {
    register(app) {
        app.singleton("user.service", (c) => {
            return {
                createUser: (name) => {
                    const event = c.make("event");
                    const user = { id: Date.now(), name };
                    event.dispatch("user.created", user);
                    return user;
                }
            };
        });
    }

    boot(app) {
        const events = app.make("event");
        const logger = app.make("logger");

        events.listen("user.created", (user) => {
            logger.info(`Domain Event: User ${user.name} was registered!`);
        });
    }
}

// 2. Initialize Framework Application
const app = new Application();

// 3. Register Core & Custom Providers
app.register(EnvironmentServiceProvider);
app.register(ConfigServiceProvider);
app.register(LoggerServiceProvider);
app.register(EventServiceProvider);
app.register(CoreServiceProvider);
app.register(DomainServiceProvider);

// 4. Configure Application State
app.configure({
    app: { name: "Enterprise ECF API", port: 8080 }
});

// 5. Boot Core Engine
app.boot();

// 6. Bind Static Facades Context
Facade.setApplication(app);

// 7. Execute Domain Operations
Log.info("Starting Enterprise Engine...");
const userService = app.make("user.service");
userService.createUser("John Doe");
```

---

## 14. Troubleshooting & Best Practices

### 1. `ContainerError: Circular dependency detected: A -> B -> A`
- **Cause**: Service `A` requires `B` in constructor/factory, and `B` requires `A`.
- **Solution**: Defer resolution of dependency `B` until runtime invocation inside methods rather than resolving inside the container factory, or use event listeners.

### 2. `ContainerError: Service provider "X" must extend ServiceProvider.`
- **Cause**: A plain class was passed to `app.register(X)`.
- **Solution**: Ensure class `X` extends `ServiceProvider` from `@ecfjs/core`.

### 3. `TypeError: Cannot read properties of null (reading 'make')` when calling Facade
- **Cause**: Using `Config.get()` or `Log.info()` before executing `Facade.setApplication(app)`.
- **Solution**: Call `Facade.setApplication(app)` immediately after `app.boot()`.

### 4. `ContainerError: Application.listen() has no listen handler registered.`
- **Cause**: Calling `app.listen()` without registering an HTTP provider.
- **Solution**: Register an HTTP provider (such as `@ecfjs/http`) that calls `app.registerListenHandler(...)` before invoking `app.listen()`.

---

## License

[MIT](LICENSE)