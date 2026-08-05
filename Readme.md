<div align="center">
  <img src="https://github.com/linkmewaseem/ECF-Elegant-Core-Framework/raw/main/banner.png" alt="ECF Banner" width="100%" style="border-radius:12px; margin-bottom:20px;">
</div>

<br>

<div align="center">

# ECF — Elegant Core Framework

**A modular, enterprise-grade Node.js framework built on a powerful IoC container and service provider system.**

[![Version](https://img.shields.io/badge/version-1.0.0--rc.1-blue.svg)](https://github.com/linkmewaseem/ECF-Elegant-Core-Framework)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![pnpm](https://img.shields.io/badge/pnpm-11.17.0-orange.svg)](https://pnpm.io)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](https://github.com/linkmewaseem/ECF-Elegant-Core-Framework/actions)

</div>

---

## What is ECF?

ECF (Elegant Core Framework) is a **complete, enterprise-grade Node.js framework** shipped as a monorepo of 35 focused, composable packages. It covers everything from IoC container and HTTP routing to AI engines, real-time broadcasting, job queues, and developer tooling — all built natively on modern ESM with zero legacy dependencies.

**Current release: `v1.0.0-rc.1`** — Release Candidate. All packages are feature-complete and test-passing.

---

## Table of Contents

- [Ecosystem Overview](#ecosystem-overview)
- [Package Catalog](#package-catalog)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
  - [HTTP Server](#http-server)
  - [With Database](#with-database)
  - [With Auth & Validation](#with-auth--validation)
- [Core Concepts](#core-concepts)
  - [Container & Application](#container--application)
  - [Service Providers](#service-providers)
  - [Facades](#facades)
  - [Config](#config)
  - [Logger](#logger)
  - [Events](#events)
  - [Environment (.env)](#environment-env)
- [HTTP Layer](#http-layer)
  - [Routing](#routing)
  - [Request](#request)
  - [Response](#response)
  - [Middleware](#middleware)
  - [Validation](#validation)
- [Testing](#testing)
- [Developer Tooling](#developer-tooling)
- [Running Tests](#running-tests)
- [Architecture & Governance](#architecture--governance)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Ecosystem Overview

```
ECF Monorepo (35 packages)
│
├── Foundation Layer
│   ├── @ecfjs/core          — IoC container, app lifecycle, facades, logger, events, env
│   ├── @ecfjs/contracts     — Interface contracts and shared type definitions
│   └── @ecfjs/support       — Utility helpers: Arr, Str, Collection, Fluent, Macroable
│
├── HTTP & Presentation
│   ├── @ecfjs/http          — Router, Request, Response, Middleware, HttpKernel, HttpServer
│   ├── @ecfjs/validation    — Pipe-based validation engine, 40+ built-in rules, fluent builder
│   └── @ecfjs/view          — AST template engine, layouts, components, directives
│
├── Data Layer
│   ├── @ecfjs/database      — Eloquent Active Record ORM, schema builder, migrations, seeders
│   ├── @ecfjs/cache         — Multi-driver cache with stampede protection
│   └── @ecfjs/search        — Vector + full-text search, faceting, ReRanker pipeline
│
├── Enterprise Services
│   ├── @ecfjs/auth          — Guards, JWT, session, multi-driver auth
│   ├── @ecfjs/queue         — BullMQ-compatible job queues, retries, batches
│   ├── @ecfjs/mail          — Nodemailer, Mailable classes, queued delivery
│   ├── @ecfjs/storage       — Local, S3, cloud drivers, URL signing, streams
│   ├── @ecfjs/upload        — Multipart file uploads, MIME validation, size limits
│   ├── @ecfjs/media         — Image resizing, audio/video transcoding (via sharp)
│   ├── @ecfjs/broadcast     — WebSocket channels, presence, pub-sub
│   ├── @ecfjs/notifications — Multi-channel alerts (email, SMS, Slack, push, in-app)
│   ├── @ecfjs/scheduler     — Cron jobs, overlap prevention, distributed locking
│   └── @ecfjs/logging       — 12 drivers, multi-channel rotation, OpenTelemetry, PII redaction
│
├── API Platform
│   ├── @ecfjs/api           — OpenAPI generator, JSON:API resources, versioning
│   └── @ecfjs/ai            — 8 AI drivers (OpenAI, Anthropic, Gemini, Ollama, Groq…), RAG, MCP
│
├── Developer Tooling
│   ├── @ecfjs/testing       — DI test contexts, HTTP assertions, model factories, snapshots
│   ├── @ecfjs/devkit        — AST code injection, YAML blueprint compiler, ecf doctor
│   ├── @ecfjs/devtools      — Telescope-style dashboard, query inspector, job monitor
│   ├── @ecfjs/cli           — ecf new, ecf make:*, ecf migrate, scaffold tooling
│   ├── @ecfjs/console       — Artisan-style commands, argument parsing, interactive prompts
│   ├── @ecfjs/observability — OpenTelemetry tracing, metrics, span instrumentation
│   ├── @ecfjs/skeleton      — Application starter bootstrap structure
│   └── @ecfjs/config        — Dot-notation config, environment layering, reactive events
│
└── ORM Extensions
    ├── @ecfjs/audit         — Full model change audit trail
    ├── @ecfjs/sluggable     — Auto URL-friendly slugs
    ├── @ecfjs/soft-deletes  — deleted_at soft delete behavior
    ├── @ecfjs/timestamps    — created_at / updated_at auto-management
    └── @ecfjs/uuids         — UUID primary keys
```

---

## Package Catalog

| Package | Version | Description |
|---|---|---|
| `@ecfjs/core` | `1.0.0-rc.1` | IoC container, application lifecycle, facades, config, logger, events, env |
| `@ecfjs/contracts` | `1.0.0-rc.1` | Interface contracts and type definitions |
| `@ecfjs/support` | `1.0.0-rc.1` | Arr, Str, Collection, LazyCollection, Fluent, Macroable |
| `@ecfjs/http` | `1.0.0-rc.1` | Router, Request, Response, Middleware, HttpKernel, HttpServer |
| `@ecfjs/validation` | `1.0.0-rc.1` | Pipe-based rules, fluent builder, nested fields, array wildcards |
| `@ecfjs/view` | `1.0.0-rc.1` | AST template engine, layouts, components, directives |
| `@ecfjs/database` | `1.0.0-rc.1` | Eloquent Active Record ORM, QueryBuilder, migrations, seeders |
| `@ecfjs/cache` | `1.0.0-rc.1` | Multi-driver cache, stampede protection, tagged invalidation |
| `@ecfjs/search` | `1.0.0-rc.1` | Vector + full-text search, faceting, ReRanker pipeline |
| `@ecfjs/auth` | `1.0.0-rc.1` | Guards, JWT, session management, multi-driver auth |
| `@ecfjs/queue` | `1.0.0-rc.1` | Job queues, retries, delayed jobs, batch processing |
| `@ecfjs/mail` | `1.0.0-rc.1` | Nodemailer, Mailable classes, queued delivery |
| `@ecfjs/storage` | `1.0.0-rc.1` | Local, S3, cloud drivers, URL signing, streams |
| `@ecfjs/upload` | `1.0.0-rc.1` | Multipart uploads, MIME validation, size limits |
| `@ecfjs/media` | `1.0.0-rc.1` | Image/audio/video processing via sharp |
| `@ecfjs/broadcast` | `1.0.0-rc.1` | WebSocket channels, presence, event-driven pub-sub |
| `@ecfjs/notifications` | `1.0.0-rc.1` | Email, SMS, Slack, push, in-app multi-channel notifications |
| `@ecfjs/scheduler` | `1.0.0-rc.1` | Cron jobs, overlap prevention, distributed locking |
| `@ecfjs/logging` | `1.0.0-rc.1` | 12 drivers, multi-channel rotation, OpenTelemetry, PII redaction |
| `@ecfjs/api` | `1.0.0-rc.1` | OpenAPI generator, JSON:API resources, versioning, rate limiting |
| `@ecfjs/ai` | `1.0.0-rc.1` | OpenAI/Anthropic/Gemini/Ollama/Groq drivers, streaming, RAG, MCP |
| `@ecfjs/testing` | `1.0.0-rc.1` | DI test contexts, HTTP/DB assertions, model factories, time travel |
| `@ecfjs/devkit` | `1.0.0-rc.1` | AST code injection, YAML blueprint compiler, ecf doctor/validate |
| `@ecfjs/devtools` | `1.0.0-rc.1` | Telescope-style dashboard, query inspector, job monitor |
| `@ecfjs/cli` | `1.0.0-rc.1` | `ecf new`, `ecf make:*`, `ecf migrate`, scaffold tooling |
| `@ecfjs/console` | `1.0.0-rc.1` | Artisan-style commands, argument parsing, interactive prompts |
| `@ecfjs/observability` | `1.0.0-rc.1` | OpenTelemetry tracing, metrics, span instrumentation |
| `@ecfjs/skeleton` | `1.0.0-rc.1` | Application starter bootstrap structure |
| `@ecfjs/config` | `1.0.0-rc.1` | Dot-notation config, environment layering, reactive events |
| `@ecfjs/audit` | `1.0.0` | ORM plugin — full model change audit trail |
| `@ecfjs/sluggable` | `1.0.0` | ORM plugin — auto URL-friendly slugs |
| `@ecfjs/soft-deletes` | `1.0.0` | ORM plugin — deleted_at soft delete behavior |
| `@ecfjs/timestamps` | `1.0.0` | ORM plugin — created_at / updated_at auto-management |
| `@ecfjs/uuids` | `1.0.0` | ORM plugin — UUID primary keys |

---

## Requirements

- **Node.js** `>=22`
- **pnpm** `>=11` (workspace management)
- ESM modules (`"type": "module"`)

---

## Installation

Clone the repository and install all dependencies:

```bash
git clone https://github.com/linkmewaseem/ECF-Elegant-Core-Framework.git
cd ECF-Elegant-Core-Framework
pnpm install
```

---

## Quick Start

### HTTP Server

```js
import { Application, Facade } from "@ecfjs/core";
import { HttpServiceProvider, Route } from "@ecfjs/http";

const app = new Application();
app.register(HttpServiceProvider);
app.boot();
Facade.setApplication(app);

// Define routes
Route.get("/", (req, res) => {
    return res.json({ message: "Hello from ECF!" });
});

Route.get("/users/{id}", (req, res) => {
    const { id } = req.params;
    return res.json({ id, name: "John Doe" });
});

Route.post("/users", async (req, res) => {
    const body = await req.body();
    return res.status(201).json({ created: true, data: body });
});

// Start the server
app.listen(3000, () => {
    console.log("ECF running at http://localhost:3000");
});
```

### With Database

```js
import { Application, Facade } from "@ecfjs/core";
import { HttpServiceProvider } from "@ecfjs/http";
import { DatabaseServiceProvider, DB } from "@ecfjs/database";

const app = new Application();
app.register(DatabaseServiceProvider);
app.register(HttpServiceProvider);
app.boot();
Facade.setApplication(app);

// Query using the DB facade
const users = await DB.table("users").where("active", true).get();

// Using an Active Record model
class User extends DB.Model {
    static table = "users";
}

const user = await User.find(1);
const active = await User.where("active", true).orderBy("name").get();
```

### With Auth & Validation

```js
import { Application, Facade } from "@ecfjs/core";
import { HttpServiceProvider, Route } from "@ecfjs/http";
import { Validator } from "@ecfjs/validation";
import { AuthServiceProvider, Auth } from "@ecfjs/auth";

const app = new Application();
app.register(AuthServiceProvider);
app.register(HttpServiceProvider);
app.boot();
Facade.setApplication(app);

Route.post("/login", async (req, res) => {
    const body = await req.body();

    // Validate input
    const validator = new Validator(body, {
        email: "required|email",
        password: "required|min:8",
    });

    if (validator.fails()) {
        return res.status(422).json({ errors: validator.errors() });
    }

    // Attempt login
    const token = await Auth.attempt(body.email, body.password);
    if (!token) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.json({ token });
});
```

---

## Core Concepts

### Container & Application

The IoC container is the heart of ECF. It manages service bindings, singleton instances, and dependency resolution with built-in circular dependency detection.

```js
import { Container, Application, ServiceProvider } from "@ecfjs/core";

// Low-level container
const container = new Container();

container.bind("logger", () => ({ log: (msg) => console.log(msg) }));
container.singleton("config", () => ({ env: "production", port: 3000 }));

const logger = container.make("logger");
const cfg1 = container.make("config");
const cfg2 = container.make("config");
console.log(cfg1 === cfg2); // true — singleton

container.has("config");   // true
container.forget("config");
container.flush();

// Application — adds provider lifecycle on top of Container
class AppProvider extends ServiceProvider {
    register(app) {
        app.singleton("mailer", () => new Mailer());
    }
    boot(app) {
        const mailer = app.make("mailer");
        mailer.connect();
    }
}

const app = new Application();
app.register(AppProvider);
app.boot();
```

**Application Methods:**

| Method | Description |
|---|---|
| `bind(name, factory)` | Register a transient service |
| `singleton(name, factory)` | Register a singleton service |
| `make(name)` | Resolve a service |
| `has(name)` | Check if binding exists |
| `forget(name)` | Remove a binding |
| `flush()` | Clear all bindings |
| `register(ProviderClass)` | Register a service provider |
| `boot()` | Run all `register()` then `boot()` hooks |
| `use(middleware)` | Register global HTTP middleware |
| `listen(port, [callback])` | Start the HTTP server |

---

### Service Providers

Providers give structure to service registration. Every provider extends `ServiceProvider` and implements `register()` and/or `boot()`.

```js
import { ServiceProvider } from "@ecfjs/core";

class CacheProvider extends ServiceProvider {
    register(app) {
        // register here — other providers may not be ready yet
        app.singleton("cache", () => new Map());
    }

    boot(app) {
        // all providers are registered by this point
        const config = app.make("config");
        console.log("Cache driver:", config.get("cache.driver"));
    }
}
```

**Built-in Core Providers:**

| Provider | Binding | Description |
|---|---|---|
| `ConfigServiceProvider` | `"config"` | Registers `ConfigManager` |
| `LoggerServiceProvider` | `"logger"` | Registers `LoggerManager` with `ConsoleTransport` |
| `EventServiceProvider` | `"event"` | Registers `EventManager` |
| `EnvironmentServiceProvider` | `"env"` | Loads `.env` and registers `EnvManager` |
| `CoreServiceProvider` | — | Bootstraps all core sub-systems |
| `DatabaseServiceProvider` | `"database"` | Registers database connection and ORM |

**HTTP Provider:**

| Provider | Binding Keys | Description |
|---|---|---|
| `HttpServiceProvider` | `"router"`, `"http.kernel"`, `"http.server"`, … | Full HTTP stack |

---

### Facades

Facades are static proxies to container services — clean, short-hand API without manual `app.make()`.

```js
import { Config, Log, Event, Env } from "@ecfjs/core";
import { Route } from "@ecfjs/http";

// Must call once after boot()
Facade.setApplication(app);

// Config
Config.set("app.name", "ECF");
Config.get("app.name");               // "ECF"
Config.get("missing.key", "default"); // "default"

// Logger
Log.info("Server started", { port: 3000 });
Log.warning("High memory usage");
Log.error("Request failed", { status: 500 });
Log.critical("Database unreachable");

// Events
Event.listen("user.created", (payload) => {
    console.log("New user:", payload.name);
});
Event.dispatch("user.created", { name: "Alice" });

// Environment
Env.get("DB_HOST", "localhost");
Env.has("APP_KEY"); // true / false

// Routing
Route.get("/", handler);
Route.post("/users", [UserController, "store"]);
```

---

### Config

`ConfigManager` supports dot-notation paths for deeply nested configuration.

```js
import { ConfigManager } from "@ecfjs/core";

const config = new ConfigManager();

config.set("app.name", "ECF");
config.set("database.host", "localhost");
config.set("database.port", 5432);

config.get("app.name");                   // "ECF"
config.get("database.port");              // 5432
config.get("missing.key", "default");     // "default"
config.has("database.host");              // true
```

---

### Logger

`LoggerManager` routes log calls to pluggable transports.

```js
import { LoggerManager, ConsoleTransport, Transport } from "@ecfjs/core";

const logger = new LoggerManager();
logger.addTransport(new ConsoleTransport());

logger.info("App started");
logger.warning("Disk space low", { free: "500MB" });
logger.error("Request failed", { status: 500 });
logger.critical("Database connection lost");
logger.debug("Query executed", { sql: "SELECT * FROM users", ms: 3 });

// Custom transport
class FileTransport extends Transport {
    log(level, message, context = {}) {
        // write to a log file
    }
}

logger.addTransport(new FileTransport());
logger.removeTransport(existingTransport);
```

---

### Events

`EventManager` provides synchronous event broadcasting with built-in error isolation.

```js
import { EventManager } from "@ecfjs/core";

const events = new EventManager(logger);

events.listen("order.placed", (payload) => {
    console.log("Order placed:", payload.orderId);
});

// Returns array of any listener errors
const errors = events.dispatch("order.placed", { orderId: 42 });

events.has("order.placed");    // true
events.forget("order.placed"); // remove all listeners for this event
events.clear();                // remove all events
```

---

### Environment (.env)

`EnvironmentServiceProvider` automatically loads `.env` from `process.cwd()` on boot.

```env
APP_NAME=ECF
APP_PORT=3000
DB_HOST=localhost
DB_PASSWORD=secret
```

```js
import { EnvManager, DotEnvLoader } from "@ecfjs/core";

// Manual loading
const parsed = DotEnvLoader.load("./.env"); // { APP_NAME: "ECF", ... }

// Via EnvManager
const env = new EnvManager();
env.set("APP_NAME", "ECF");
env.get("APP_NAME");              // "ECF"
env.get("MISSING", "fallback");   // "fallback"
env.has("APP_NAME");              // true
env.all();                        // { APP_NAME: "ECF", ... }
env.clear();
```

---

## HTTP Layer

### Routing

```js
import { Route } from "@ecfjs/http";

// All HTTP verbs
Route.get("/",              (req, res) => res.json({ ok: true }));
Route.post("/users",        (req, res) => res.status(201).json({ created: true }));
Route.put("/users/{id}",    (req, res) => res.json({ updated: true }));
Route.patch("/users/{id}",  (req, res) => res.json({ patched: true }));
Route.delete("/users/{id}", (req, res) => res.json({ deleted: true }));
Route.any("/webhook",       (req, res) => res.json({ ok: true }));

// Dynamic parameters
Route.get("/users/{id}", (req, res) => {
    const { id } = req.params;
    return res.json({ id });
});

// Multiple parameters
Route.get("/users/{userId}/posts/{postId}", (req, res) => {
    const { userId, postId } = req.params;
    return res.json({ userId, postId });
});

// Controller syntax
Route.get("/users", [UserController, "index"]);
Route.post("/users", [UserController, "store"]);

// Route groups and prefixes
Route.group("/api/v1", () => {
    Route.get("/users", [UserController, "index"]);
    Route.post("/users", [UserController, "store"]);
});

// Named routes
Route.get("/users/{id}", handler).name("users.show");
```

> **Note:** Define static routes **before** overlapping dynamic routes:
> ```js
> Route.get("/users/new", handler);  // static first
> Route.get("/users/{id}", handler); // dynamic after
> ```

---

### Request

```js
Route.get("/example", async (req, res) => {
    req.method;           // "GET"
    req.url;              // "/example?sort=asc"
    req.path;             // "/example"
    req.query;            // { sort: "asc" }
    req.params;           // { id: "42" } — set by router
    req.headers;          // frozen copy of all headers

    req.header("content-type");      // "application/json"
    req.hasHeader("authorization");  // true / false

    req.cookies;          // { session: "abc123" }

    const body = await req.body();   // parsed request body

    req.ip;               // "127.0.0.1"
    req.protocol;         // "http" or "https"
    req.secure;           // false
    req.host;             // "localhost:3000"
    req.origin;           // "http://localhost:3000"
    req.userAgent;        // "Mozilla/5.0 ..."

    req.isJson();         // true if Content-Type is application/json
    req.wantsJson();      // true if Accept is application/json
    req.isXhr();          // true if X-Requested-With: XMLHttpRequest

    return res.json({ ok: true });
});
```

---

### Response

```js
Route.get("/demo", (req, res) => {
    res.text("Hello World");                      // text/plain
    res.html("<h1>Hello</h1>");                   // text/html
    res.json({ message: "ok", data: [1, 2, 3] }); // application/json

    res.status(201).json({ created: true });
    res.status(404).text("Not Found");

    res.header("X-Request-Id", "abc-123");
    res.hasHeader("X-Request-Id"); // true
    res.removeHeader("X-Request-Id");

    res.redirect("/new-location");    // 302
    res.redirect("/permanent", 301); // 301

    res.status(204).end();

    res.send("plain string");         // auto content-type
    res.send({ key: "value" });       // auto JSON
    res.send(Buffer.from("binary"));  // buffer

    res.headersSent; // true / false
});
```

---

### Middleware

```js
import { Middleware } from "@ecfjs/http";

// Function-style
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    return next();
};

const auth = (req, res, next) => {
    if (!req.header("authorization")) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    return next();
};

// Class-style
class CorsMiddleware extends Middleware {
    handle(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        return next();
    }
}

// Global middleware (every request)
app.use(logger);
app.use(new CorsMiddleware());

// Route-specific middleware
Route.use("GET", "/dashboard", auth);
Route.get("/dashboard", (req, res) => res.json({ secret: true }));
```

---

### Validation

`@ecfjs/validation` provides a Laravel-inspired pipe validation engine.

```js
import { Validator, Rule } from "@ecfjs/validation";

const data = {
    name: "Alice",
    email: "alice@example.com",
    age: 25,
    role: "admin",
};

const validator = new Validator(data, {
    name:  "required|min:2|max:100",
    email: "required|email",
    age:   "required|integer|between:18,120",
    role:  "required|in:admin,editor,viewer",
});

if (validator.fails()) {
    return res.status(422).json({ errors: validator.errors() });
}

const validated = validator.validated(); // only validated keys

// Fluent Rule builder
const rules = {
    password: [
        Rule.required(),
        Rule.min(8),
        Rule.confirmed(),
    ],
    tags: [
        Rule.array(),
        Rule.max(10),
    ],
};

// Nested fields
const nestedRules = {
    "user.email":       "required|email",
    "user.profile.bio": "max:500",
    "tags.*.name":      "required|string",
};

// Custom rules
validator.extend("uppercase", (value) => {
    return value === value.toUpperCase() || "The :attribute must be uppercase.";
});
```

---

## Testing

`@ecfjs/testing` provides a complete testing toolkit built on Node.js native `node:test`.

```js
import { test } from "node:test";
import { TestApplication, TestHttpClient, makeFactory } from "@ecfjs/testing";

// DI Test Context
test("resolves service from container", async (t) => {
    await TestApplication.run(async ({ app }) => {
        const config = app.make("config");
        assert.strictEqual(config.get("app.name"), "ECF");
    });
});

// HTTP Assertions
test("GET /users returns 200", async (t) => {
    const client = new TestHttpClient(app);
    const res = await client.get("/api/v1/users");

    res.assertStatus(200);
    res.assertJson({ success: true });
    res.assertJsonCount("data", 3);
});

// Model Factories
const UserFactory = makeFactory({
    name: () => "Test User",
    email: () => `user_${Date.now()}@test.com`,
    active: true,
});

const user = UserFactory.create();
const users = UserFactory.createMany(5);
const admin = UserFactory.state({ role: "admin" }).create();

// Time Travel
import { TimeTravel } from "@ecfjs/testing";

TimeTravel.freeze("2025-01-01T00:00:00Z");
// ... test time-sensitive logic ...
TimeTravel.restore();

// Snapshot Testing
import { Snapshot } from "@ecfjs/testing";
Snapshot.assert("response-shape", actualData);
```

---

## Developer Tooling

### DevKit — Code Generation

```bash
# Create a new ECF project
ecf new my-app

# Generate code
ecf make:controller UserController
ecf make:model User
ecf make:migration create_users_table
ecf make:provider AuthServiceProvider
ecf make:command SendWelcomeEmail

# Validate architecture
ecf validate
ecf architecture
ecf doctor

# Undo last generation
ecf undo
```

### AI Engine

```js
import { AI, Driver } from "@ecfjs/ai";

// Simple chat
const response = await AI.driver("openai").chat([
    { role: "user", content: "Explain ECF in one sentence." }
]);

// Streaming
const stream = AI.driver("anthropic").stream([
    { role: "user", content: "Write me a service provider." }
]);
for await (const chunk of stream) process.stdout.write(chunk);

// RAG Pipeline
const rag = AI.rag()
    .withChunker("markdown")
    .withEmbedder("openai")
    .withReranker("cross-encoder")
    .withMemory();

const answer = await rag.ask("How does the container work?", documents);
```

---

## Running Tests

Run all tests across all packages:

```bash
pnpm test
```

Run TypeScript type checking:

```bash
pnpm typecheck
```

Run tests for a single package:

```bash
cd packages/core && node --test
cd packages/http && node --test
cd packages/database && node --test
```

Run ecosystem benchmarks:

```bash
node --test packages/testing/tests/benchmarks/EcosystemBenchmark.test.js
```

---

## Architecture & Governance

The full ecosystem architecture and governance documents live in [`docs/governance/`](docs/governance/):

| Document | Description |
|---|---|
| [ECOSYSTEM_ARCHITECTURE.md](docs/governance/ECOSYSTEM_ARCHITECTURE.md) | Layer boundaries and package dependency rules |
| [PACKAGE_CATALOG.md](docs/governance/PACKAGE_CATALOG.md) | Maturity status for all 35 packages |
| [API_STABILITY_POLICY.md](docs/governance/API_STABILITY_POLICY.md) | SemVer policy and deprecation directives |
| [COMPATIBILITY_MATRIX.md](docs/governance/COMPATIBILITY_MATRIX.md) | Cross-package compatibility grid |
| [PERFORMANCE_CONTRACT.md](docs/governance/PERFORMANCE_CONTRACT.md) | Official performance SLAs |
| [DEPENDENCY_RULES.md](docs/governance/DEPENDENCY_RULES.md) | Allowed vs. forbidden dependency directions |
| [SECURITY_REVIEW_CHECKLIST.md](docs/governance/SECURITY_REVIEW_CHECKLIST.md) | Security review per package |
| [CI_RELEASE_PIPELINE.md](docs/governance/CI_RELEASE_PIPELINE.md) | Quality gates and release pipeline |

Architecture Decision Records (ADRs) are in [`docs/adr/`](docs/adr/).

---

## Roadmap

### ✅ Completed — v1.0.0-rc.1

All milestones are complete. ECF ships 35 packages covering the full server-side framework stack:

- ✅ **Foundation** — `@ecfjs/core`, `@ecfjs/contracts`, `@ecfjs/support`
- ✅ **HTTP & Presentation** — `@ecfjs/http`, `@ecfjs/validation`, `@ecfjs/view`
- ✅ **Data Layer** — `@ecfjs/database`, `@ecfjs/cache`, `@ecfjs/search`
- ✅ **Enterprise Services** — `@ecfjs/auth`, `@ecfjs/queue`, `@ecfjs/mail`, `@ecfjs/storage`, `@ecfjs/upload`, `@ecfjs/media`, `@ecfjs/broadcast`, `@ecfjs/notifications`, `@ecfjs/scheduler`, `@ecfjs/logging`
- ✅ **API Platform** — `@ecfjs/api`, `@ecfjs/ai`
- ✅ **Developer Tooling** — `@ecfjs/testing`, `@ecfjs/devkit`, `@ecfjs/devtools`, `@ecfjs/cli`, `@ecfjs/console`, `@ecfjs/observability`, `@ecfjs/skeleton`, `@ecfjs/config`
- ✅ **ORM Extensions** — `@ecfjs/audit`, `@ecfjs/sluggable`, `@ecfjs/soft-deletes`, `@ecfjs/timestamps`, `@ecfjs/uuids`
- ✅ **Governance** — Full architecture freeze, ADRs, governance docs, CI/CD pipeline

### 🔲 Upcoming — v1.0.0 Stable

- 🔲 Publish all packages to npm
- 🔲 Documentation website and API reference
- 🔲 Community examples and tutorials

---

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting pull requests. All contributors must follow the [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

## License

ECF is open-source software licensed under the [MIT License](LICENSE).

---

<div align="center">
  <strong>Built with ❤️ by the ECF Team</strong>
</div>