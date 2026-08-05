# ADR-001: Pure IoC Container & Service Provider Foundation

## Status
**Accepted** (Implemented in `@ecfjs/core`)

## Context
When designing the core foundation of ECF, we needed an application bootstrap mechanism that could wire dependencies without tightly coupling the core to any specific engine (HTTP, ORM, View, CLI). Legacy frameworks often hardcode Web or HTTP dependencies into their Application object.

## Decision
1. `@ecfjs/core` is built strictly around an Inversion of Control (IoC) Container (`Container`), Service Providers (`ServiceProvider`), DotEnv loader, ConfigManager, Logger, and Event Dispatcher.
2. `@ecfjs/core` has **zero dependencies** on any outer package (`@ecfjs/http`, `@ecfjs/database`, `@ecfjs/view`, etc.).
3. Outer engines register themselves at runtime via `ServiceProvider` subclasses (e.g. `HttpServiceProvider`, `DatabaseServiceProvider`).

## Consequences

### Positive
- `@ecfjs/core` can be used standalone in microservices, queue workers, CLI tools, or background cron runners without installing HTTP or View packages.
- Zero cyclic dependencies between foundation and application layers.
- Strict contract-driven service resolution via IoC container strings.

### Negative
- Requires explicit `ServiceProvider` registration during application bootstrap.
