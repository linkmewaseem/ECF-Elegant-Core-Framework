# @ecf/core — Package Architecture

`@ecf/core` is the foundational dependency injection container and application bootstrapper for the ECF ecosystem. Every other package in the monorepo depends on it, directly or transitively.

## Core Components

| Component | Responsibility |
|---|---|
| `Container` | Bindings map, singleton instance cache, circular-dependency-safe resolution |
| `Application` | Wraps `Container`; adds provider lifecycle (`register()` → `boot()`), global HTTP middleware registration (`use()`), and a pluggable `listen()` entrypoint |
| `ServiceProvider` | Base class with `register(app)` / `boot(app)` hooks. Providers receive `app` as a parameter — they hold no implicit reference to the container via `this` |
| `Facade` | Static `Proxy`-based accessor pattern. Subclasses implement `accessor()`; `Facade.create()` wraps them so property access resolves against the live container binding |
| `ConfigManager` | Dot-notation key/value store, used for all `config/*.js` files across the ecosystem |
| `LoggerManager` + `Transport` | Pluggable, multi-transport logging (`ConsoleTransport` ships by default) |
| `EventManager` | Synchronous pub/sub with per-listener error isolation |
| `EnvManager` + `DotEnvLoader` | `.env` file parsing and typed access |

## Built-in Service Providers

`ConfigServiceProvider`, `LoggerServiceProvider`, `EventServiceProvider`, `EnvironmentServiceProvider`, `CoreServiceProvider`, and a re-exported `DatabaseServiceProvider` binding point. Downstream packages (`@ecf/http`, `@ecf/view`, `@ecf/database`, `@ecf/auth`, ...) each ship their own `ServiceProvider` subclass that consuming applications register explicitly — `@ecf/core` does not auto-register anything outside its own providers.

## Resolution Model

- `Container.make(name)` throws `ContainerError` for an unknown binding. There is **no implicit default value** at the container level — default-value ergonomics exist only in `ConfigManager.get(path, defaultValue)`, which is a distinct system.
- Singleton bindings are resolved once and cached in `Container.instances`; transient bindings (`bind()`) re-run their factory on every `make()` call.
- Resolution tracks an in-flight `Set` of binding names (`resolving`) to detect and reject circular dependencies with a descriptive chain in the thrown error.

## Dependency Rules

- **Zero dependencies on outer packages.** `@ecf/core` must never import `@ecf/http`, `@ecf/database`, `@ecf/view`, or any other package that depends on it. This is enforced structurally — violating it would create a circular package dependency across the monorepo.
- Any package that needs container/application behavior imports `@ecf/core`; `@ecf/core` never imports back.
- `Facade` and `ServiceProvider` are the two integration points every other package builds on: new packages ship a `*ServiceProvider` (registered explicitly by the consuming app) and, optionally, one or more `Facade` subclasses for ergonomic static access.

## Known Constraints

- `Application.boot()` instantiates each registered provider with `new ProviderClass()` — no constructor injection. Providers must do all their work inside `register(app)`/`boot(app)`, using the `app` argument.
- `app.use(middleware)` and `app.listen(...)` both require bindings/handlers that only exist once an HTTP-capable provider (`HttpServiceProvider` from `@ecf/http`) has been registered. Calling either before that provider is registered throws a `ContainerError` with a message pointing at the missing registration.