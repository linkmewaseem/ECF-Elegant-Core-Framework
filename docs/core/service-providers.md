# Service Providers

## Introduction

Service Providers are the central location for bootstrapping and configuring services within ECF applications. Packages and custom modules use Service Providers to bind items into the container and wire up framework components.

## Why use it?

Instead of manually wiring container bindings across multiple entry files, Service Providers consolidate service configuration into self-contained, reusable modules.

## Syntax

```js
import { ServiceProvider } from "@ecf/core";

export default class CustomServiceProvider extends ServiceProvider {
    register(app) {
        // Register container bindings here
    }

    boot(app) {
        // Perform setup tasks after all services are registered
    }
}
```

## Example

```js
import { ServiceProvider } from "@ecf/core";

export default class CacheServiceProvider extends ServiceProvider {
    register(app) {
        app.singleton("cache", () => {
            const store = new Map();
            return {
                get: (key) => store.get(key),
                set: (key, val) => store.set(key, val)
            };
        });
    }

    boot(app) {
        const cache = app.make("cache");
        cache.set("bootedAt", Date.now());
        console.log("Cache Service Provider successfully booted.");
    }
}
```

## How it Works

1. **`register(app)`**: Called first during `app.boot()`. Used strictly to add bindings to the container using `app.bind()` or `app.singleton()`.
2. **`boot(app)`**: Called after all service providers have executed their `register()` methods. Used for initialization tasks that rely on other container services already being bound.

## Parameters

### `register(app)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `app` | `Application` | The current ECF `Application` instance. |

### `boot(app)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `app` | `Application` | The current ECF `Application` instance. |

## Return Value

Both `register()` and `boot()` return `void` (or `undefined`).

## Notes

> [!NOTE]
> Default base implementation of `ServiceProvider` provides no-op `register()` and `boot()` methods, so overriding either method in your subclass is optional.

> [!IMPORTANT]
> Never attempt to resolve other container services inside the `register()` method, as target services might not have been registered yet. Resolve dependent services inside `boot()`.

## Best Practices

- Keep `register()` clean and dedicated solely to container binding calls.
- Put event listener bindings, routes, and inter-service initializations inside `boot()`.

## Common Mistakes

- **Resolving dependencies inside `register()`**: Attempting `app.make("otherService")` inside `register()` when `otherService` is registered by a provider later in the queue.

## Tips

- Built-in providers like `HttpServiceProvider`, `ConfigServiceProvider`, `DatabaseServiceProvider`, `EventServiceProvider`, and `LoggerServiceProvider` all extend `ServiceProvider`.

## Related Features

- [Application Lifecycle](file:///f:/ecf/docs/core/application.md)
- [IoC Container](file:///f:/ecf/docs/core/container.md)

---

## Summary

Service Providers organize application setup into discrete `register()` and `boot()` phases for clean dependency management.

## Next Topic

[Facades Architecture](file:///f:/ecf/docs/core/facades.md)

## Related Topics

- [IoC Container](file:///f:/ecf/docs/core/container.md)
- [Application Lifecycle](file:///f:/ecf/docs/core/application.md)
