# IoC Container

## Introduction

The Inversion of Control (IoC) Container is the foundation of ECF. It acts as a central repository for managing class dependencies, service creation, and object resolution across your application.

## Why use it?

Hardcoding object dependencies directly inside classes leads to tightly coupled code that is difficult to test and maintain. The ECF Container decouples dependency creation from implementation, allowing services to be swapped or mocked effortlessly.

## Syntax

```js
import { Container } from "@ecf/core";

const container = new Container();

// Register a factory binding
container.bind(name, factoryFunction);

// Register a singleton binding
container.singleton(name, factoryFunction);

// Resolve a service from the container
const service = container.make(name);
```

## Example

```js
import { Container } from "@ecf/core";

const container = new Container();

// 1. Transient factory binding (creates new instance on every make)
container.bind("logger", () => {
    return { log: (msg) => console.log(`[LOG]: ${msg}`) };
});

// 2. Singleton binding (creates single instance shared across all resolutions)
container.singleton("config", () => {
    return { env: "production", port: 8080 };
});

// 3. Resolving services
const logger1 = container.make("logger");
const logger2 = container.make("logger");
console.log(logger1 === logger2); // false

const config1 = container.make("config");
const config2 = container.make("config");
console.log(config1 === config2); // true
```

## How it Works

1. **`container.bind("logger", factory)`**: Registers a binding named `"logger"`. Every time `container.make("logger")` is called, the factory function executes and returns a new object.
2. **`container.singleton("config", factory)`**: Registers a binding marked as a singleton. When resolved for the first time, the result is cached. Subsequent calls return the cached instance.
3. **Circular Dependency Guard**: The container tracks currently resolving keys in a `Set`. If service A resolves service B which in turn attempts to resolve service A, the container throws a `ContainerError` detailing the circular cycle path (`A -> B -> A`).

## Parameters

### `bind(name, factory)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `name` | `string` | The unique non-empty string key for the service binding. |
| `factory` | `Function` | A callback function returning the constructed service instance. |

### `singleton(name, factory)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `name` | `string` | The unique non-empty string key for the singleton service. |
| `factory` | `Function` | A callback function returning the initial singleton instance. |

### `make(name)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `name` | `string` | The key of the registered service to resolve. |

### `has(name)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `name` | `string` | The key of the service binding to check. |

### `forget(name)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `name` | `string` | The key of the service binding and cached instance to remove. |

### `flush()`

Takes no parameters. Clears all registered bindings and cached instances.

## Return Value

- `bind()` and `singleton()` return `undefined`.
- `make(name)` returns the resolved service instance.
- `has(name)` returns a `boolean` (`true` if binding exists, `false` otherwise).
- `forget(name)` returns `undefined`.
- `flush()` returns `undefined`.

## Notes

> [!NOTE]
> The container automatically passes itself as the first argument to binding factory functions: `(container) => new MyService(container.make("dependency"))`.

> [!WARNING]
> Attempting to resolve an unregistered binding key will throw a `ContainerError`.

## Best Practices

- Name service bindings using dot-notation string keys for clarity (e.g., `"db.connection"`, `"http.kernel"`).
- Use `singleton()` for stateless utilities or heavyweight objects like database connection pools.
- Use `bind()` for lightweight stateful instances that shouldn't share state across calls.

## Common Mistakes

- **Passing non-function factory**: `container.bind("service", new Service())` throws an error. Always pass a factory callback: `container.bind("service", () => new Service())`.
- **Creating circular dependencies**: Having service A depend on service B while service B depends on service A inside factory functions.

## Tips

- Clean up bindings during unit tests using `container.flush()`.

## Related Features

- [Application Lifecycle](file:///f:/ecf/docs/core/application.md)
- [Service Providers](file:///f:/ecf/docs/core/service-providers.md)
- [Facades](file:///f:/ecf/docs/core/facades.md)

---

## Summary

The IoC Container manages service registration, object creation, singleton caching, and dependency lookup with built-in circular dependency detection.

## Next Topic

[Application Lifecycle](file:///f:/ecf/docs/core/application.md)

## Related Topics

- [Service Providers](file:///f:/ecf/docs/core/service-providers.md)
- [Facades Architecture](file:///f:/ecf/docs/core/facades.md)
