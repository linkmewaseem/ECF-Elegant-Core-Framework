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
│  @ecfjs/cli   │        │ @ecfjs/console│               │@ecfjs/devtools│         │ @ecfjs/queue  │
└─────┬───────┘        └──────┬──────┘               └──────┬──────┘         └──────┬──────┘
      │                       │                             │                       │
      └───────────────────────┼─────────────────────────────┴───────────────────────┘
                              │
               ┌──────────────┴──────────────┐
               │         @ecfjs/view           │
               └──────────────┬──────────────┘
                              │
               ┌──────────────┴──────────────┐
               │         @ecfjs/http           │
               └──────────────┬──────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
 ┌──────▼──────┐                             ┌──────▼──────┐
 │@ecfjs/database│                             │@ecfjs/validat.│
 └──────┬──────┘                             └──────┬──────┘
        │                                           │
        └─────────────────────┬─────────────────────┘
                              │
               ┌──────────────┴──────────────┐
               │        @ecfjs/extensions      │
               └──────────────┬──────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
 ┌──────▼──────┐                             ┌──────▼──────┐
 │  @ecfjs/core  │                             │@ecfjs/support │
 └─────────────┘                             └─────────────┘
```

---

## 📐 Ecosystem Principles & Design Rules

### 1. Inversion of Control & Contract Isolation
- **Core is Pure**: `@ecfjs/core` sits at the foundation and has zero knowledge of HTTP, View, Database, or CLI engines.
- **Provider-Based Wiring**: High-level features (e.g. HTTP routing, ORM models, Blade-like view rendering) register themselves via `ServiceProvider` classes.
- **Contract-Driven Boundaries**: Low-level packages define abstract interfaces and contracts; higher-level engines implement or resolve them dynamically via the IoC Container.

### 2. Standalone Package Usability
- Every engine (`@ecfjs/http`, `@ecfjs/view`, `@ecfjs/validation`, `@ecfjs/database`) can be installed and executed independently in any standard Node.js/ESM application without forcing the entire framework stack.

### 3. Utility Decoupling (`@ecfjs/support`)
- Common data structures, string manipulation helpers, collection classes, and array utilities are housed in `@ecfjs/support`. This keeps `@ecfjs/core` ultra-lean while allowing all ecosystem packages to reuse high-performance utilities safely.

---

## 📦 Layer Definitions & Responsibilities

| Layer | Package Name | Primary Responsibility | Outer Dependencies |
|---|---|---|---|
| **Foundation** | `@ecfjs/core` | IoC Container, Application Lifecycle, Service Provider Engine, Config Manager, Logger, Event Dispatcher, DotEnv Loader. | *None (Zero dependencies)* |
| **Utilities** | `@ecfjs/support` | Collections (`Collection`, `LazyCollection`), `Str`, `Arr`, `Macroable`, `Fluent`, `UUID/ULID`, Date Abstractions. | `@ecfjs/core` (Optional / Lean) |
| **Data & Persistence** | `@ecfjs/database` | Connection Manager, Multi-Driver AST QueryBuilder (SQLite, MySQL, Postgres), Hybrid ORM, Scopes, Observers, Relations. | `@ecfjs/core`, `@ecfjs/support` |
| **Validation** | `@ecfjs/validation` | Pipeline & Rule-based Validator (`required`, `email`, `min`, `max`, `custom`), RuleRegistry, ValidationErrorBag. | *Standalone / @ecfjs/support* |
| **Authentication** | `@ecfjs/auth` | Driver-based Authentication (Session, JWT, API Keys, Tokens), Password Hashing, Gates/Policies, MFA. | `@ecfjs/core`, `@ecfjs/support` |
| **HTTP Transport** | `@ecfjs/http` | Request/Response abstraction, Trie-based Router, Middleware Pipeline, HttpKernel, Event Bus, Session & Cookie handling. | `@ecfjs/core`, `@ecfjs/validation` |
| **Templating** | `@ecfjs/view` | AST Directive Parser (`@if`, `@for`, `@switch`, `@component`), Lexer, Compiler, ViewCache, Dependency Tracking, Custom Directives. | `@ecfjs/core`, `@ecfjs/http` |
| **Extensions Platform** | `@ecfjs/extensions` | Modular plugins platform (`@ecfjs/soft-deletes`, `@ecfjs/timestamps`, `@ecfjs/uuids`, `@ecfjs/sluggable`, `@ecfjs/audit`). | `@ecfjs/database`, `@ecfjs/core` |
| **Official First-Party Extensions** | `@ecfjs/commerce` | E-commerce utilities, cart management, currency handling, and payment gateway adapters. | `@ecfjs/core`, `@ecfjs/support` |
| **App Skeleton** | `@ecfjs/skeleton` | Full-stack project blueprint, Directory Layout (`app/`, `config/`, `routes/`, `views/`), App Bootstrap. | Core, DB, HTTP, View, Validation |
| **Tooling & CLI** | `@ecfjs/cli` | Code Generators, Signature Parsing, Stub Compilers, Diagnostics (`ecf doctor`). | All core engines |
| **Console Engine** | `@ecfjs/console` | Artisan-grade interactive CLI framework, command definitions, options/args validation, tables & progress bars. | `@ecfjs/core`, `@ecfjs/support` |
| **Dev Tools** | `@ecfjs/devtools` | Request Debug Bar, SQL Query Timeline, Memory & Performance Profiler, Route Inspector. | `@ecfjs/core`, `@ecfjs/http`, `@ecfjs/database` |
| **Queue & Events** | `@ecfjs/queue` | Background Jobs, Async Worker Pool, Scheduled Tasks, Memory / DB / Redis Drivers. | `@ecfjs/core`, `@ecfjs/database` |

---

## 🔒 Encapsulation & Boundary Enforcement
1. **No Downstream Import Leakage**: A lower layer MUST NEVER import symbols from a higher layer (e.g. `@ecfjs/core` ➔ `@ecfjs/http` is strictly forbidden).
2. **Hidden Internal Implementations**: Internal compiler passes, AST node classes, and runtime registries are encapsulated under `src/internal/` or `src/compiler/` and are NOT exposed via package `exports`.
