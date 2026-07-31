# @ecf/core — Package Architecture

`@ecf/core` is the foundational dependency injection container and application bootstrapper for the ECF ecosystem.

## Core Components
- **`Container`**: IoC container with singleton caching, transient factories, and circular dependency detection.
- **`Application`**: Application wrapper extending Container with provider-based bootstrapping (`register()`, `boot()`).
- **`ServiceProvider`**: Base class for registering services and booting application features.
- **`Facade`**: Static proxy shortcuts delegating static calls to container bindings.
- **`ConfigManager`**: Dot-notation configuration management (`app.db.host`).
- **`LoggerManager`**: Transport-based logging framework (`info`, `warning`, `error`, `critical`).
- **`EventManager`**: Error-isolated synchronous event dispatcher.
- **`EnvManager` & `DotEnvLoader`**: `.env` file loader and environment variable manager.

## Dependency Rules
- ZERO dependencies on outer packages (`@ecf/http`, `@ecf/database`, `@ecf/view`, etc.).
