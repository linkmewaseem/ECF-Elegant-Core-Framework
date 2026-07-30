# Installation & Quickstart

## Introduction

ECF (Elegant Core Framework) is a modular Node.js web framework built on dependency injection, expressive routing, type-safe database queries, and robust validation. This guide will walk you through installing ECF and starting your first server.

## Why use it?

Setting up modern web frameworks often requires combining disparate libraries for IoC containers, HTTP routing, query building, and validation. ECF brings all these core features together in a unified, composable monorepo architecture.

## Syntax

```bash
# Install ECF packages using your preferred package manager
pnpm add @ecf/core @ecf/http @ecf/database @ecf/validation
```

## Example

Here is a complete, working HTTP server using ECF:

```js
import { Application, Facade, HttpServiceProvider, Route } from "@ecf/http";

// 1. Initialize the Application instance
const app = new Application();

// 2. Register the HTTP Service Provider
app.register(HttpServiceProvider);

// 3. Boot application providers
app.boot();

// 4. Set the global Facade root
Facade.setApplication(app);

// 5. Define HTTP routes
Route.get("/", (req, res) => {
    return res.json({ message: "Welcome to ECF!" });
});

Route.get("/users/{id}", (req, res) => {
    const { id } = req.params;
    return res.json({ id, status: "active" });
});

// 6. Start the server on port 3000
app.listen(3000, () => {
    console.log("ECF Server listening on http://localhost:3000");
});
```

## How it Works

1. **`const app = new Application();`**: Creates a new instance of the core ECF Application, which manages the service container lifecycle.
2. **`app.register(HttpServiceProvider);`**: Binds the HTTP kernel, router, body parsers, and server handlers to the container.
3. **`app.boot();`**: Executes the boot sequence across all registered service providers.
4. **`Facade.setApplication(app);`**: Configures static facades (`Route`, `DB`, `Config`, etc.) to point to the main container.
5. **`Route.get(...)`**: Registers route handlers for incoming GET requests matching specific path patterns.
6. **`app.listen(3000)`**: Binds the HTTP server handler to Node's native HTTP module and starts listening for incoming connections.

## Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `port` | `number` | The port number on which the HTTP server will listen. |
| `callback` | `Function` | Optional callback executed when the server starts listening. |

## Return Value

The `app.listen()` method returns the `Application` instance to allow method chaining.

## Notes

> [!NOTE]
> ECF requires **Node.js >= 22** and native ECMAScript Modules (`"type": "module"` in package.json).

> [!TIP]
> Use `pnpm` workspace management for optimal speed and dependency deduplication.

## Best Practices

- Always call `app.boot()` before defining routes or making container resolutions.
- Register all Service Providers before calling `app.boot()`.
- Use Facades like `Route` or `DB` after calling `Facade.setApplication(app)`.

## Common Mistakes

- **Forgetting `app.boot()`**: Calling `app.make()` or using Facades before `boot()` can cause resolution errors.
- **Missing `"type": "module"`**: Using CommonJS `require()` instead of ESM `import` statements.

## Tips

- You can chain `.register()` calls: `app.register(HttpServiceProvider).register(DatabaseServiceProvider).boot();`.

## Related Features

- [Container Architecture](file:///f:/ecf/docs/core/container.md)
- [Application Lifecycle](file:///f:/ecf/docs/core/application.md)
- [HTTP Routing](file:///f:/ecf/docs/http/routing.md)

---

## Summary

In this guide, you learned how to install ECF packages and set up a fully functional HTTP web server using `Application`, `HttpServiceProvider`, and the `Route` facade.

## Next Topic

[Container Architecture](file:///f:/ecf/docs/core/container.md)

## Related Topics

- [Application Lifecycle](file:///f:/ecf/docs/core/application.md)
- [Service Providers](file:///f:/ecf/docs/core/service-providers.md)
