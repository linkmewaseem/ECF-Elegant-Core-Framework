// ECF Official Documentation Data Store - Complete & Comprehensive Edition
window.ECF_DOCS = [
  {
    id: "installation",
    category: "Getting Started",
    icon: "🚀",
    title: "Installation & Quickstart",
    path: "getting-started/installation.md",
    content: `# Installation & Quickstart

## Introduction

ECF (Elegant Composable Framework) is a modular Node.js web framework built on dependency injection, expressive routing, type-safe database queries, and robust validation. This guide will walk you through installing ECF and starting your first server.

## Why use it?

Setting up modern web frameworks often requires combining disparate libraries for IoC containers, HTTP routing, query building, and validation. ECF brings all these core features together in a unified, composable monorepo architecture.

## Syntax

\`\`\`bash
# Install ECF packages using your preferred package manager
pnpm add @ecf/core @ecf/http @ecf/database @ecf/validation
\`\`\`

## Example

Here is a complete, working HTTP server using ECF:

\`\`\`js
import { Application, Facade, HttpServiceProvider, Route } from "@ecf/http";

// 1. Initialize the Application instance
const app = new Application();

// 2. Register the HTTP Service Provider
app.register(HttpServiceProvider);

// 3. Boot application providers
app.boot();

// 4. Set the global Facade root
Facade.setApplication(app);

// 5. Define HTTP routes
Route.get("/", (req, res) => {
    return res.json({ message: "Welcome to ECF!" });
});

Route.get("/users/{id}", (req, res) => {
    const { id } = req.params;
    return res.json({ id, status: "active" });
});

// 6. Start the server on port 3000
app.listen(3000, () => {
    console.log("ECF Server listening on http://localhost:3000");
});
\`\`\`

## How it Works

1. **\`const app = new Application();\`**: Creates a new instance of the core ECF Application, which manages the service container lifecycle.
2. **\`app.register(HttpServiceProvider);\`**: Binds the HTTP kernel, router, body parsers, and server handlers to the container.
3. **\`app.boot();\`**: Executes the boot sequence across all registered service providers.
4. **\`Facade.setApplication(app);\`**: Configures static facades (\`Route\`, \`DB\`, \`Config\`, etc.) to point to the main container.
5. **\`Route.get(...)\`**: Registers route handlers for incoming GET requests matching specific path patterns.
6. **\`app.listen(3000)\`**: Binds the HTTP server handler to Node's native HTTP module and starts listening for incoming connections.

## Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| \`port\` | \`number\` | The port number on which the HTTP server will listen. |
| \`callback\` | \`Function\` | Optional callback executed when the server starts listening. |

## Return Value

The \`app.listen()\` method returns the \`Application\` instance to allow method chaining.

## Notes

> [!NOTE]
> ECF requires **Node.js >= 22** and native ECMAScript Modules (\`"type": "module"\` in package.json).

> [!TIP]
> Use \`pnpm\` workspace management for optimal speed and dependency deduplication.

## Best Practices

- Always call \`app.boot()\` before defining routes or making container resolutions.
- Register all Service Providers before calling \`app.boot()\`.
- Use Facades like \`Route\` or \`DB\` after calling \`Facade.setApplication(app)\`.

## Common Mistakes

- **Forgetting \`app.boot()\`**: Calling \`app.make()\` or using Facades before \`boot()\` can cause resolution errors.
- **Missing \`"type": "module"\`**: Using CommonJS \`require()\` instead of ESM \`import\` statements.

## Tips

- You can chain \`.register()\` calls: \`app.register(HttpServiceProvider).register(DatabaseServiceProvider).boot();\`.`
  },
  {
    id: "container",
    category: "Core Architecture",
    icon: "🏗️",
    title: "IoC Container",
    path: "core/container.md",
    content: `# IoC Container

## Introduction

The Inversion of Control (IoC) Container is the foundation of ECF. It acts as a central repository for managing class dependencies, service creation, and object resolution across your application.

## Syntax

\`\`\`js
import { Container } from "@ecf/core";

const container = new Container();

container.bind(name, factoryFunction);
container.singleton(name, factoryFunction);
const service = container.make(name);
\`\`\`

## Example

\`\`\`js
import { Container } from "@ecf/core";

const container = new Container();

// Transient factory binding (new instance per make)
container.bind("logger", () => ({ log: (msg) => console.log(msg) }));

// Singleton binding (cached single instance)
container.singleton("config", () => ({ env: "production" }));

const log1 = container.make("logger");
const log2 = container.make("logger");
console.log(log1 === log2); // false

const cfg1 = container.make("config");
const cfg2 = container.make("config");
console.log(cfg1 === cfg2); // true
\`\`\`

## Circular Dependency Guard

The container tracks currently resolving keys in a \`Set\`. If service A depends on service B while service B depends on service A, the container throws a \`ContainerError\` detailing the cycle: \`Circular dependency detected: A -> B -> A\`.`
  },
  {
    id: "application",
    category: "Core Architecture",
    icon: "🏗️",
    title: "Application Lifecycle",
    path: "core/application.md",
    content: `# Application Lifecycle

## Introduction

The \`Application\` class acts as the main entry point and orchestrator for ECF applications. It wraps the IoC Container and adds provider management, middleware delegation, and HTTP server bootstrapping hooks.

## Example

\`\`\`js
import { Application, ServiceProvider } from "@ecf/core";

class DatabaseProvider extends ServiceProvider {
    register(app) {
        app.singleton("db", () => ({ connected: true }));
    }
}

const app = new Application();
app.register(DatabaseProvider);
app.boot();

console.log(app.make("db")); // { connected: true }
\`\`\``
  },
  {
    id: "service-providers",
    category: "Core Architecture",
    icon: "🏗️",
    title: "Service Providers",
    path: "core/service-providers.md",
    content: `# Service Providers

## Introduction

Service Providers are the central location for bootstrapping and configuring services within ECF applications.

## Example

\`\`\`js
import { ServiceProvider } from "@ecf/core";

export default class CacheServiceProvider extends ServiceProvider {
    register(app) {
        app.singleton("cache", () => new Map());
    }

    boot(app) {
        const cache = app.make("cache");
        cache.set("bootedAt", Date.now());
    }
}
\`\`\``
  },
  {
    id: "facades",
    category: "Core Architecture",
    icon: "🏗️",
    title: "Facades Architecture",
    path: "core/facades.md",
    content: `# Facades Architecture

## Introduction

Facades provide a static proxy interface to services registered in the ECF IoC container.

## Built-in Facades Reference

| Facade | Package | Accessor Key | Target Service |
| ------ | ------- | ------------ | -------------- |
| \`Config\` | \`@ecf/core\` | \`"config"\` | \`ConfigManager\` |
| \`Env\` | \`@ecf/core\` | \`"env"\` | \`EnvManager\` |
| \`Event\` | \`@ecf/core\` | \`"events"\` | \`EventManager\` |
| \`Log\` | \`@ecf/core\` | \`"logger"\` | \`LoggerManager\` |
| \`Route\` | \`@ecf/http\` | \`"router"\` | \`Router\` |
| \`DB\` | \`@ecf/database\` | \`"db"\` | \`DatabaseManager\` |`
  },
  {
    id: "config",
    category: "Core Architecture",
    icon: "🏗️",
    title: "Configuration Manager",
    path: "core/config.md",
    content: `# Configuration Manager

## Introduction

The Configuration Manager provides a unified store for application configuration options using simple dot-notation access strings.

## Example

\`\`\`js
import { Config } from "@ecf/core";

Config.set("app.name", "My App");
Config.set("database.mysql.host", "127.0.0.1");

console.log(Config.get("app.name")); // "My App"
console.log(Config.get("app.debug", false)); // false
\`\`\``
  },
  {
    id: "environment",
    category: "Core Architecture",
    icon: "🏗️",
    title: "Environment Management",
    path: "core/environment.md",
    content: `# Environment Management

## Introduction

The Environment Manager handles environment variables for ECF applications by loading \`.env\` files into the environment store.

## Example

\`\`\`env
APP_ENV=development
APP_PORT=3000
DATABASE_URL=sqlite://storage/app.db
\`\`\`

\`\`\`js
import { Env } from "@ecf/core";

console.log(Env.get("APP_ENV")); // "development"
console.log(Env.get("APP_PORT", 8080)); // "3000"
\`\`\``
  },
  {
    id: "events",
    category: "Core Architecture",
    icon: "🏗️",
    title: "Event System",
    path: "core/events.md",
    content: `# Event System

## Introduction

The Event System provides a publish-subscribe implementation for emitting and listening to application events with error isolation.

## Example

\`\`\`js
import { Event } from "@ecf/core";

Event.listen("user.registered", (user) => {
    console.log(\`Sending welcome email to \${user.email}\`);
});

Event.dispatch("user.registered", { id: 10, email: "john@example.com" });
\`\`\``
  },
  {
    id: "logging",
    category: "Core Architecture",
    icon: "🏗️",
    title: "Logging System",
    path: "core/logging.md",
    content: `# Logging System

## Introduction

The Logging System provides structured log handling across different severity levels (\`info\`, \`warning\`, \`error\`, \`critical\`) using pluggable log transports.

## Example

\`\`\`js
import { Log } from "@ecf/core";

Log.info("User logged in", { userId: 42 });
Log.warning("High CPU usage", { usage: "92%" });
Log.error("DB connection error", { host: "db.local" });
Log.critical("Payment service down", { provider: "Stripe" });
\`\`\``
  },
  {
    id: "routing",
    category: "HTTP Layer",
    icon: "🌐",
    title: "HTTP Routing",
    path: "http/routing.md",
    content: `# HTTP Routing

## Introduction

The HTTP Router maps incoming HTTP request URLs and HTTP methods to specific closure handlers or controllers.

## Example

\`\`\`js
import { Route } from "@ecf/http";

Route.get("/health", (req, res) => res.json({ status: "OK" }));

Route.get("/users/{id}", (req, res) => {
    return res.json({ userId: req.params.id });
}).where("id", "[0-9]+").name("users.show");

Route.group({ prefix: "/api/v1" }, () => {
    Route.get("/orders", (req, res) => res.json({ orders: [] }));
});
\`\`\``
  },
  {
    id: "requests",
    category: "HTTP Layer",
    icon: "🌐",
    title: "HTTP Requests",
    path: "http/requests.md",
    content: `# HTTP Requests

## Introduction

The \`Request\` class encapsulates incoming HTTP request data including URL paths, query parameters, route parameters, headers, cookies, client IP addresses, and request bodies.

## Example

\`\`\`js
import { Route } from "@ecf/http";

Route.post("/posts/{id}/comments", async (req, res) => {
    const postId = req.params.id;
    const clientIp = req.ip();
    const token = req.header("Authorization");
    const data = await req.body();

    return res.status(201).json({ postId, comment: data.comment, clientIp });
});
\`\`\``
  },
  {
    id: "responses",
    category: "HTTP Layer",
    icon: "🌐",
    title: "HTTP Responses",
    path: "http/responses.md",
    content: `# HTTP Responses

## Introduction

The \`Response\` class handles building and returning outgoing HTTP responses, status codes, headers, cookies, content types, redirects, and response bodies.

## Example

\`\`\`js
import { Route } from "@ecf/http";

Route.post("/api/items", (req, res) => {
    return res
        .status(201)
        .header("X-Custom-Header", "ECF")
        .json({ id: 101, name: "New Item" });
});

Route.get("/old-dashboard", (req, res) => res.redirect("/new-dashboard", 302));
\`\`\``
  },
  {
    id: "middleware",
    category: "HTTP Layer",
    icon: "🌐",
    title: "Middleware Pipeline",
    path: "http/middleware.md",
    content: `# Middleware Pipeline

## Introduction

Middleware functions intercept incoming HTTP requests before they reach route handlers.

## Example

\`\`\`js
import { Application, Route } from "@ecf/http";

const app = new Application();

// Global Middleware
app.use(async (req, res, next) => {
    console.log(\`[LOG]: \${req.method} \${req.path}\`);
    await next();
});

// Route Middleware
const authMiddleware = async (req, res, next) => {
    const token = req.header("authorization");
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    await next();
};

Route.get("/admin", (req, res) => res.json({ secret: true })).middleware(authMiddleware);
\`\`\``
  },
  {
    id: "connections",
    category: "Database & ORM",
    icon: "🗄️",
    title: "Database Connections & Drivers",
    path: "database/connections.md",
    content: `# Database Connections & Drivers

## Introduction

The ECF Database Layer manages connection pools, database drivers, and raw SQL queries across SQLite, MySQL, and PostgreSQL backends through a unified \`DatabaseManager\` interface.

## Syntax

\`\`\`js
import { Config, DB } from "@ecf/database";

Config.set("database", {
    default: "sqlite",
    connections: {
        sqlite: { driver: "sqlite", database: "./storage/database.sqlite" },
        mysql: { driver: "mysql", host: "127.0.0.1", database: "my_app", username: "root", password: "" },
        postgres: { driver: "pgsql", host: "127.0.0.1", database: "my_app", username: "postgres", password: "" }
    }
});
\`\`\`

## Example

\`\`\`js
import { DB } from "@ecf/database";

// Raw SQL Queries
const users = await DB.select("SELECT * FROM users WHERE status = ?", ["active"]);

// Transactions
await DB.transaction(async (conn) => {
    await conn.insert("INSERT INTO accounts (user_id, balance) VALUES (?, ?)", [1, 500]);
});
\`\`\``
  },
  {
    id: "query-builder",
    category: "Database & ORM",
    icon: "🗄️",
    title: "Query Builder",
    path: "database/query-builder.md",
    content: `# Query Builder

## Introduction

The ECF Query Builder provides a fluent, chainable API for building and executing SQL database queries safely across SQLite, MySQL, and PostgreSQL backends.

## Example

\`\`\`js
import { DB } from "@ecf/database";

// SELECT query
const users = await DB.table("users")
    .select("id", "name", "role")
    .where("status", "active")
    .orderBy("created_at", "DESC")
    .get();

// INSERT query
const newId = await DB.table("users").insert({ name: "Jane Doe", email: "jane@example.com" });

// UPDATE query
await DB.table("users").where("id", 42).update({ status: "suspended" });

// DELETE query
await DB.table("users").where("status", "inactive").delete();
\`\`\``
  },
  {
    id: "orm-models",
    category: "Database & ORM",
    icon: "🗄️",
    title: "ORM Models & Relationships",
    path: "database/orm-models.md",
    content: `# ORM Models & Relationships

## Introduction

The ECF ORM (Object-Relational Mapping) provides an Active Record pattern implementation mapping database tables to JavaScript classes.

## Example

\`\`\`js
import { Model } from "@ecf/database";

class User extends Model {
    static table = "users";

    posts() {
        return this.hasMany(Post, "user_id");
    }
}

class Post extends Model {
    static table = "posts";

    user() {
        return this.belongsTo(User, "user_id");
    }
}

const user = await User.find(1);
const userPosts = await user.posts().get();
\`\`\``
  },
  {
    id: "schema-migrations",
    category: "Database & ORM",
    icon: "🗄️",
    title: "Schema & Migrations",
    path: "database/schema-migrations.md",
    content: `# Schema & Migrations

## Introduction

The Schema Builder provides a database-agnostic interface for defining and altering database tables, column types, primary keys, and constraints.

## Example

\`\`\`js
import { Schema } from "@ecf/database";

await Schema.create("users", (table) => {
    table.id();
    table.string("name");
    table.string("email").unique();
    table.boolean("is_active").default(true);
    table.timestamps();
});

await Schema.dropIfExists("temporary_logs");
\`\`\``
  },
  {
    id: "validator",
    category: "Validation",
    icon: "✅",
    title: "Validation System",
    path: "validation/validator.md",
    content: `# Validation System

## Introduction

The ECF Validation System provides structured data validation for HTTP request inputs, form submissions, and domain objects using expressive rule syntax.

## Example

\`\`\`js
import { Validator } from "@ecf/validation";

const inputData = { username: "john_doe", email: "john@example.com", age: 25 };
const rules = { username: "required|string|min:3", email: "required|email", age: "required|numeric|min:18" };

const validator = Validator.make(inputData, rules);

if (validator.fails()) {
    console.log(validator.errors().all());
}
\`\`\``
  },
  {
    id: "directory-structure",
    category: "Architecture Reference",
    icon: "📐",
    title: "Directory Structure & Reference",
    path: "architecture/directory-structure.md",
    content: `# Directory Structure & Reference

## Workspace Architecture

\`\`\`
ecf/
├── docs/                           # Official framework documentation site
└── packages/                       # Workspace framework packages
    ├── core/                       # @ecf/core — IoC Container, Providers, Config, Events, Logger, Env
    ├── http/                       # @ecf/http — Router, Request, Response, Middleware, Server
    ├── database/                   # @ecf/database — Connections, Drivers, Query Builder, ORM Models, Schema
    └── validation/                 # @ecf/validation — Rule Registry, Validator, Error Bags
\`\`\`

## Package Summary

- **\`@ecf/core\`**: Application foundation, IoC Container, Service Providers, Facade static proxies, ConfigManager, LoggerManager, EventManager, EnvManager.
- **\`@ecf/http\`**: HttpServer, HttpKernel, Router, Route, Request, Response, Middleware Pipeline, AttributeBag.
- **\`@ecf/database\`**: DatabaseManager, ConnectionManager, SQLite/MySQL/Postgres Drivers, QueryBuilder, Model Active Record, Relationships, Schema.
- **\`@ecf/validation\`**: Validator, RuleRegistry, ValidationErrorBag, Built-in & Custom rules.`
  }
];
