# ECF — Master Ecosystem Architecture

This document defines the **Master Ecosystem Architecture** for the ECF (Elegant Core Framework) platform. ECF is designed as a decoupled, contract-driven, high-performance Node.js framework composed of independent, specialized packages.

---

## 🏛️ High-Level Layer Hierarchy

```
                               ┌───────────────────────────┐
                               │       ECF Application     │
                               │      (Skeleton / App)     │
                               └─────────────┬─────────────┘
                                             │
      ┌───────────────────────┬──────────────┴──────────────┬───────────────────────┐
      │                       │                             │                       │
┌─────▼───────┐        ┌──────▼──────┐               ┌──────▼──────┐         ┌──────▼──────┐
│  @ecf/cli   │        │ @ecf/console│               │@ecf/devtools│         │ @ecf/queue  │
└─────┬───────┘        └──────┬──────┘               └──────┬──────┘         └──────┬──────┘
      │                       │                             │                       │
      └───────────────────────┼─────────────────────────────┴───────────────────────┘
                              │
               ┌──────────────┴──────────────┐
               │         @ecf/view           │
               └──────────────┬──────────────┘
                              │
               ┌──────────────┴──────────────┐
               │         @ecf/http           │
               └──────────────┬──────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
 ┌──────▼──────┐                             ┌──────▼──────┐
 │@ecf/database│                             │@ecf/validat.│
 └──────┬──────┘                             └──────┬──────┘
        │                                           │
        └─────────────────────┬─────────────────────┘
                              │
               ┌──────────────┴──────────────┐
               │        @ecf/extensions      │
               └──────────────┬──────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
 ┌──────▼──────┐                             ┌──────▼──────┐
 │  @ecf/core  │                             │@ecf/support │
 └─────────────┘                             └─────────────┘
```

---

## 📐 Ecosystem Principles & Design Rules

### 1. Inversion of Control & Contract Isolation
- **Core is Pure**: `@ecf/core` sits at the foundation and has zero knowledge of HTTP, View, Database, or CLI engines.
- **Provider-Based Wiring**: High-level features (e.g. HTTP routing, ORM models, Blade-like view rendering) register themselves via `ServiceProvider` classes.
- **Contract-Driven Boundaries**: Low-level packages define abstract interfaces and contracts; higher-level engines implement or resolve them dynamically via the IoC Container.

### 2. Standalone Package Usability
- Every engine (`@ecf/http`, `@ecf/view`, `@ecf/validation`, `@ecf/database`) can be installed and executed independently in any standard Node.js/ESM application without forcing the entire framework stack.

### 3. Utility Decoupling (`@ecf/support`)
- Common data structures, string manipulation helpers, collection classes, and array utilities are housed in `@ecf/support`. This keeps `@ecf/core` ultra-lean while allowing all ecosystem packages to reuse high-performance utilities safely.

---

## 📦 Layer Definitions & Responsibilities

| Layer | Package Name | Primary Responsibility | Outer Dependencies |
|---|---|---|---|
| **Foundation** | `@ecf/core` | IoC Container, Application Lifecycle, Service Provider Engine, Config Manager, Logger, Event Dispatcher, DotEnv Loader. | *None (Zero dependencies)* |
| **Utilities** | `@ecf/support` | Collections (`Collection`, `LazyCollection`), `Str`, `Arr`, `Macroable`, `Fluent`, `UUID/ULID`, Date Abstractions. | `@ecf/core` (Optional / Lean) |
| **Data & Persistence** | `@ecf/database` | Connection Manager, Multi-Driver AST QueryBuilder (SQLite, MySQL, Postgres), Hybrid ORM, Scopes, Observers, Relations. | `@ecf/core`, `@ecf/support` |
| **Validation** | `@ecf/validation` | Pipeline & Rule-based Validator (`required`, `email`, `min`, `max`, `custom`), RuleRegistry, ValidationErrorBag. | *Standalone / @ecf/support* |
| **HTTP Transport** | `@ecf/http` | Request/Response abstraction, Trie-based Router, Middleware Pipeline, HttpKernel, Event Bus, Session & Cookie handling. | `@ecf/core`, `@ecf/validation` |
| **Templating** | `@ecf/view` | AST Directive Parser (`@if`, `@for`, `@switch`, `@component`), Lexer, Compiler, ViewCache, Dependency Tracking, Custom Directives. | `@ecf/core`, `@ecf/http` |
| **Extensions** | `@ecf/extensions` | Official modular plugins (`@ecf/soft-deletes`, `@ecf/timestamps`, `@ecf/uuids`, `@ecf/sluggable`, `@ecf/audit`). | `@ecf/database`, `@ecf/core` |
| **App Skeleton** | `@ecf/skeleton` | Full-stack project blueprint, Directory Layout (`app/`, `config/`, `routes/`, `views/`), App Bootstrap. | Core, DB, HTTP, View, Validation |
| **Tooling & CLI** | `@ecf/cli` | Code Generators, Signature Parsing, Stub Compilers, Diagnostics (`ecf doctor`). | All core engines |
| **Console Engine** | `@ecf/console` | Artisan-grade interactive CLI framework, command definitions, options/args validation, tables & progress bars. | `@ecf/core`, `@ecf/support` |
| **Dev Tools** | `@ecf/devtools` | Request Debug Bar, SQL Query Timeline, Memory & Performance Profiler, Route Inspector. | `@ecf/core`, `@ecf/http`, `@ecf/database` |
| **Queue & Events** | `@ecf/queue` | Background Jobs, Async Worker Pool, Scheduled Tasks, Memory / DB / Redis Drivers. | `@ecf/core`, `@ecf/database` |

---

## 🔒 Encapsulation & Boundary Enforcement
1. **No Downstream Import Leakage**: A lower layer MUST NEVER import symbols from a higher layer (e.g. `@ecf/core` ➔ `@ecf/http` is strictly forbidden).
2. **Hidden Internal Implementations**: Internal compiler passes, AST node classes, and runtime registries are encapsulated under `src/internal/` or `src/compiler/` and are NOT exposed via package `exports`.
