# Application Lifecycle

## Introduction

The `Application` class acts as the main entry point and orchestrator for ECF applications. It wraps the IoC Container and adds provider management, middleware delegation, and HTTP server bootstrapping hooks.

## Why use it?

While you can use the `Container` standalone, the `Application` class provides a structured bootstrap lifecycle (`register` -> `boot` -> `listen`), ensuring services are initialized in the correct order across modular packages.

## Syntax

```js
import { Application } from "@ecf/core";

const app = new Application();

// Register a service provider class
app.register(ServiceProviderClass);

// Boot all registered providers
app.boot();

// Start application listener
app.listen(port, callback);
```

## Example

```js
import { Application, ServiceProvider } from "@ecf/core";

class DatabaseProvider extends ServiceProvider {
    register(app) {
        app.singleton("db", () => ({ connected: true }));
    }

    boot(app) {
        console.log("Database provider booted.");
    }
}

const app = new Application();

// Register and boot provider
app.register(DatabaseProvider);
app.boot();

const db = app.make("db");
console.log(db); // { connected: true }
```

## How it Works

1. **`new Application()`**: Initializes an internal `Container` instance and a `Set` of registered provider classes.
2. **`app.register(ProviderClass)`**: Validates that `ProviderClass` extends `ServiceProvider` and adds it to the registration queue.
3. **`app.boot()`**: Instantiates each registered provider and executes its `.register(app)` method followed by its `.boot(app)` method.
4. **`app.listen()`**: Delegates listening logic to a registered listen handler (such as the one set by `HttpServiceProvider`).

## Parameters

### `register(ProviderClass)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `ProviderClass` | `typeof ServiceProvider` | A class extending `ServiceProvider`. |

### `use(middleware)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `middleware` | `Function` | Global middleware function to register into the HTTP middleware registry. |

### `listen(...args)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `...args` | `any` | Arguments forwarded to the registered server listen handler (e.g. port number, host, callback). |

### `registerListenHandler(handler)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `handler` | `Function` | Function called when `app.listen()` is executed. |

## Return Value

- `register()`, `boot()`, `use()`, `listen()`, and `registerListenHandler()` return the `Application` instance (`this`) for method chaining.

## Notes

> [!NOTE]
> `Application` delegates all container methods (`bind`, `singleton`, `make`, `has`, `forget`, `flush`) directly to its underlying `Container`.

> [!WARNING]
> Calling `app.listen()` without registering a service provider that defines a listen handler (e.g., `HttpServiceProvider`) will throw a `ContainerError`.

## Best Practices

- Chain `.register()` calls during application setup.
- Boot your application (`app.boot()`) before calling `app.listen()` or resolving services.

## Common Mistakes

- **Passing instance instead of class**: Calling `app.register(new CustomProvider())` throws an error. Pass the uninstantiated class: `app.register(CustomProvider)`.

## Tips

- You can query container bindings directly on the application instance using `app.make("binding")`.

## Related Features

- [IoC Container](file:///f:/ecf/docs/core/container.md)
- [Service Providers](file:///f:/ecf/docs/core/service-providers.md)
- [HTTP Service Provider](file:///f:/ecf/docs/http/routing.md)

---

## Summary

The `Application` class manages service provider registration, application lifecycle booting, and HTTP server delegation.

## Next Topic

[Service Providers](file:///f:/ecf/docs/core/service-providers.md)

## Related Topics

- [IoC Container](file:///f:/ecf/docs/core/container.md)
- [Facades](file:///f:/ecf/docs/core/facades.md)
