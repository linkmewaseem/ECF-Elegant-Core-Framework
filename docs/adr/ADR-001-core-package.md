# ADR-001: Pure IoC Container & Service Provider Foundation

## Status
**Accepted** (Implemented in `@ecf/core`)

## Context
When designing the core foundation of ECF, we needed an application bootstrap mechanism that could wire dependencies without tightly coupling the core to any specific engine (HTTP, ORM, View, CLI). Legacy frameworks often hardcode Web or HTTP dependencies into their Application object.

## Decision
1. `@ecf/core` is built strictly around an Inversion of Control (IoC) Container (`Container`), Service Providers (`ServiceProvider`), DotEnv loader, ConfigManager, Logger, and Event Dispatcher.
2. `@ecf/core` has **zero dependencies** on any outer package (`@ecf/http`, `@ecf/database`, `@ecf/view`, etc.).
3. Outer engines register themselves at runtime via `ServiceProvider` subclasses (e.g. `HttpServiceProvider`, `DatabaseServiceProvider`).

## Consequences

### Positive
- `@ecf/core` can be used standalone in microservices, queue workers, CLI tools, or background cron runners without installing HTTP or View packages.
- Zero cyclic dependencies between foundation and application layers.
- Strict contract-driven service resolution via IoC container strings.

### Negative
- Requires explicit `ServiceProvider` registration during application bootstrap.
