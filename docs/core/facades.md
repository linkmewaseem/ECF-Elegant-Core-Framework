# Facades Architecture

## Introduction

Facades provide a static proxy interface to services registered in the ECF IoC container. They allow you to invoke container service methods statically without manually resolving container instances.

## Why use it?

Resolving container services explicitly (e.g. `app.make("config").get("app.name")`) can create repetitive boilerplate across controllers and helpers. Facades offer clean, expressive, static syntax like `Config.get("app.name")` while preserving testability.

## Syntax

```js
import { Facade } from "@ecf/core";

// Define a custom facade
class CustomFacade extends Facade {
    static getAccessor() {
        return "container.service.key";
    }
}
```

## Example

```js
import { Application, Facade, ServiceProvider } from "@ecf/core";

// 1. Create a service and provider
class GreetingService {
    sayHello(name) {
        return `Hello, ${name}!`;
    }
}

class CustomProvider extends ServiceProvider {
    register(app) {
        app.singleton("greeting", () => new GreetingService());
    }
}

// 2. Define custom Facade
class Greeting extends Facade {
    static getAccessor() {
        return "greeting";
    }
}

// 3. Setup Application
const app = new Application();
app.register(CustomProvider);
app.boot();
Facade.setApplication(app);

// 4. Call static facade method
console.log(Greeting.sayHello("Alice")); // "Hello, Alice!"
```

## How it Works

1. **`Facade.setApplication(app)`**: Connects the static `Facade` root class to the running ECF `Application` container.
2. **`static getAccessor()`**: Each facade subclass overrides this method to return the container binding key string (e.g. `"route"`, `"db"`, `"config"`).
3. **JavaScript `Proxy` / Traps**: When a static property or method is called on a Facade subclass, Facade resolves the service instance from `app.make(accessor)` and proxies the method call dynamically to that instance.

## Parameters

### `Facade.setApplication(app)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `app` | `Application` | The active ECF `Application` instance. |

### `getAccessor()`

Takes no parameters. Must be overridden by subclasses to return a `string` matching a container binding key.

## Return Value

- `Facade.setApplication()` returns `void`.
- Proxied method calls return whatever the underlying target service method returns.

## Built-in Facades

| Facade | Package | Accessor Key | Target Service |
| ------ | ------- | ------------ | -------------- |
| `Config` | `@ecf/core` | `"config"` | `ConfigManager` |
| `Env` | `@ecf/core` | `"env"` | `EnvManager` |
| `Event` | `@ecf/core` | `"events"` | `EventManager` |
| `Log` | `@ecf/core` | `"logger"` | `LoggerManager` |
| `Route` | `@ecf/http` | `"router"` | `Router` |
| `DB` | `@ecf/database` | `"db"` | `DatabaseManager` |

## Notes

> [!NOTE]
> Facades do not replace dependency injection; they are an ergonomic abstraction over the IoC container.

> [!WARNING]
> Calling Facade static methods before calling `Facade.setApplication(app)` will throw an error indicating that the application context has not been set.

## Best Practices

- Always initialize `Facade.setApplication(app)` in your application entry point right after `app.boot()`.
- Use Facades in HTTP controllers, routes, and high-level application modules for clean readability.

## Common Mistakes

- **Forgetting `getAccessor()`**: Defining a custom facade class without overriding `static getAccessor()` throws an error when invoked.

## Tips

- All built-in ECF facades inherit from the core `Facade` class and support identical static call resolution.

## Related Features

- [IoC Container](file:///f:/ecf/docs/core/container.md)
- [Configuration Manager](file:///f:/ecf/docs/core/config.md)
- [HTTP Routing](file:///f:/ecf/docs/http/routing.md)

---

## Summary

Facades provide elegant static syntax for container services while maintaining dynamic proxying to underlying IoC bindings.

## Next Topic

[Configuration Manager](file:///f:/ecf/docs/core/config.md)

## Related Topics

- [IoC Container](file:///f:/ecf/docs/core/container.md)
- [Application Lifecycle](file:///f:/ecf/docs/core/application.md)
