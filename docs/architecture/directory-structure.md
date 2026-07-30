# Directory Structure & Reference

## Introduction

This reference details the folder structure, file architecture, exported APIs, helper utilities, and configuration options across the ECF framework monorepo.

## Workspace Directory Overview

```
ecf/                                # Monorepo Root Directory
├── pnpm-workspace.yaml             # Workspace configuration defining package roots
├── package.json                    # Workspace root manifest
├── docs/                           # Official framework documentation site source
└── packages/                       # Workspace framework packages
    ├── core/                       # @ecf/core — IoC Container, Providers, Config, Events, Logger, Env
    ├── http/                       # @ecf/http — Router, Request, Response, Middleware, Server
    ├── database/                   # @ecf/database — Query Builder, Drivers, ORM Models, Schema
    └── validation/                 # @ecf/validation — Rule Registry, Validator, Error Bags
```

---

## Core Package (`packages/core`)

The `@ecf/core` package provides the foundation of the framework.

| File / Folder | Type | Description |
| ------------- | ---- | ----------- |
| `src/Application.js` | Class | Main application bootstrapper. Wraps `Container`, manages service providers, and delegates `listen()`. |
| `src/Container.js` | Class | Inversion of Control (IoC) Container. Manages service factories, singletons, and circular dependency checks. |
| `src/Binding.js` | Class | Data structure representing a container binding (stores factory function and singleton boolean flag). |
| `src/Resolver.js` | Class | Internal service resolution logic executing factory functions with container injection. |
| `src/ServiceProvider.js` | Class | Abstract base class for service providers, providing `register(app)` and `boot(app)` lifecycle hooks. |
| `src/Facade.js` | Class | Static proxy root redirecting static method calls onto underlying container service instances. |
| `src/ConfigManager.js` | Class | Manages nested configuration settings via dot-notation path strings (e.g. `"app.url"`). |
| `src/LoggerManager.js` | Class | Multi-level logging manager (`info`, `warning`, `error`, `critical`) delegating to active transports. |
| `src/events/EventManager.js` | Class | Synchronous/Asynchronous event emitter with listener error isolation. |
| `src/env/EnvManager.js` | Class | Environment key-value store holding runtime environment variables. |
| `src/env/DotEnvLoader.js` | Class | Utility parsing `.env` files into key-value pairs. |
| `src/transports/ConsoleTransport.js` | Class | Formatted console logger transport with ISO timestamp formatting. |
| `src/errors/` | Directory | Custom error hierarchy (`ECFError`, `ContainerError`, `ConfigError`, `EnvError`, `EventError`, `LoggerError`). |

---

## HTTP Package (`packages/http`)

The `@ecf/http` package provides the web server, routing, request parsing, response formatting, and middleware pipeline stack.

| File / Folder | Type | Description |
| ------------- | ---- | ----------- |
| `src/HttpServer.js` | Class | Wrapper around native Node.js `http.createServer()` delegating HTTP requests to `HttpKernel`. |
| `src/HttpKernel.js` | Class | Request execution orchestrator tying router matching, body parsing, and middleware pipeline together. |
| `src/Router.js` | Class | HTTP Router maintaining route collections, named routes, route groups, and verb matching. |
| `src/Route.js` | Class | Route definition class compiling URI patterns into regular expressions with parameter constraints. |
| `src/Request.js` | Class | Encapsulates HTTP incoming requests, headers, query string, path params, cookies, and async `body()`. |
| `src/Response.js` | Class | Fluent HTTP response builder supporting `.status()`, `.json()`, `.html()`, `.text()`, and `.redirect()`. |
| `src/Pipeline.js` | Class | Asynchronous middleware execution pipeline implementing the onion model. |
| `src/AttributeBag.js` | Class | Key-value store attached to `req.attributeBag` for passing transient context down middleware chains. |
| `src/BodyParserManager.js` | Class | Reads request streams and parses JSON and URL-encoded request body payloads. |
| `src/providers/HttpServiceProvider.js` | Class | Service Provider binding HTTP kernel, router, body parsers, and server listen handler into container. |

---

## Database Package (`packages/database`)

The `@ecf/database` package provides multi-driver database connectivity, SQL query building, schema migrations, and ORM models.

| File / Folder | Type | Description |
| ------------- | ---- | ----------- |
| `src/DatabaseManager.js` | Class | Database entry point managing database connections and raw/query builder delegation. |
| `src/ConnectionManager.js` | Class | Manages active database driver instances (SQLite, MySQL, Postgres). |
| `src/query/QueryBuilder.js` | Class | Fluent SQL query generator for `SELECT`, `INSERT`, `UPDATE`, and `DELETE` queries. |
| `src/orm/Model.js` | Class | Active Record ORM base class mapping database tables to JavaScript objects. |
| `src/orm/loader/RelationMatcher.js` | Class | Handles eager and lazy loading resolution for `hasOne`, `hasMany`, `belongsTo`, `belongsToMany`. |
| `src/schema/Schema.create()` | Method | DDL schema builder for creating and altering database tables. |
| `src/drivers/` | Directory | Database driver implementations (`SQLiteDriver`, `MySQLDriver`, `PostgresDriver`). |

---

## Validation Package (`packages/validation`)

The `@ecf/validation` package provides input validation using rule strings.

| File / Folder | Type | Description |
| ------------- | ---- | ----------- |
| `src/Validator.js` | Class | Executes validation rules against input data dictionaries. |
| `src/RuleRegistry.js` | Class | Central registry storing built-in and custom rule handlers. |
| `src/ValidationErrorBag.js` | Class | Container storing validation failure messages grouped by field. |
| `src/rules/` | Directory | Built-in validation rule implementations (`RequiredRule`, `StringRule`, `NumericRule`, `EmailRule`, `MinRule`, `MaxRule`, `InRule`, `ArrayRule`). |

---

## Summary

The ECF framework monorepo is cleanly separated into core IoC abstractions, HTTP routing/server layers, database/ORM engines, and validation subsystems.

## Next Topic

[Installation & Quickstart](file:///f:/ecf/docs/getting-started/installation.md)

## Related Topics

- [IoC Container](file:///f:/ecf/docs/core/container.md)
- [HTTP Routing](file:///f:/ecf/docs/http/routing.md)
- [Query Builder](file:///f:/ecf/docs/database/query-builder.md)
