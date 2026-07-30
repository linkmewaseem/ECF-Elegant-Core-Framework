# Middleware Pipeline

## Introduction

Middleware functions intercept incoming HTTP requests before they reach route handlers. They can inspect request details, modify request context, reject requests early, or add custom response headers.

## Why use it?

Tasks like authentication, rate limiting, CORS headers, logging, and input parsing are cross-cutting concerns. Middleware allows you to separate these concerns from business logic in route controllers.

## Syntax

```js
// Middleware function signature
const customMiddleware = async (req, res, next) => {
    // 1. Code executed BEFORE route handler
    
    // 2. Call next() to proceed down the pipeline
    await next();

    // 3. Code executed AFTER route handler completes
};

// Register globally on application
app.use(customMiddleware);

// Register on specific route
Route.get("/protected", handler).middleware(customMiddleware);
```

## Example

```js
import { Application, Facade, HttpServiceProvider, Route } from "@ecf/http";

const app = new Application();
app.register(HttpServiceProvider);

// 1. Global Logger Middleware
const loggerMiddleware = async (req, res, next) => {
    const start = Date.now();
    console.log(`[INCOMING]: ${req.method} ${req.path}`);
    await next();
    console.log(`[COMPLETED]: in ${Date.now() - start}ms`);
};
app.use(loggerMiddleware);

app.boot();
Facade.setApplication(app);

// 2. Route-specific Authentication Middleware
const authMiddleware = async (req, res, next) => {
    const token = req.header("authorization");
    if (!token || token !== "Bearer secret_token") {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    req.attributeBag.set("user", { id: 10, role: "admin" });
    await next();
};

// 3. Protected Route
Route.get("/admin/dashboard", (req, res) => {
    const user = req.attributeBag.get("user");
    return res.json({ message: "Welcome to dashboard", user });
}).middleware(authMiddleware);
```

## How it Works

1. **Onion Model Execution**: The ECF `Pipeline` executes middleware functions in order. Calling `await next()` pauses current middleware and advances execution down the pipe to the next middleware or route handler.
2. **Early Short-Circuiting**: If a middleware function returns a response (e.g. `res.status(401).json(...)`) without calling `next()`, execution stops immediately and lower-level handlers are skipped.

## Parameters

### Middleware Signature `(req, res, next)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `req` | `Request` | Incoming ECF request object. |
| `res` | `Response` | Outgoing ECF response object. |
| `next` | `Function` | Async function to trigger the next middleware in the pipeline chain. |

## Return Value

- Middleware functions return the result of `await next()` or an early HTTP `Response`.

## Notes

> [!IMPORTANT]
> Always use `await next()` when invoking `next()` inside async middleware to preserve the execution order for post-processing code.

> [!NOTE]
> Global middleware registered via `app.use()` executes for every single incoming HTTP request before route matching completes.

## Best Practices

- Store request context (like authenticated user instances) inside `req.attributeBag`.
- Return response calls directly when short-circuiting: `return res.status(403).json(...)`.

## Common Mistakes

- **Forgetting `await next()`**: Calling `next()` without `await` causes post-processing logic to execute asynchronously before down-stream middleware completes.
- **Calling `next()` twice**: Executing `next()` multiple times in a single middleware function causes duplicate handler runs.

## Tips

- You can pass an array of middleware functions to `.middleware([mw1, mw2])`.

## Related Features

- [HTTP Request](file:///f:/ecf/docs/http/requests.md)
- [HTTP Response](file:///f:/ecf/docs/http/responses.md)
- [HTTP Routing](file:///f:/ecf/docs/http/routing.md)

---

## Summary

The Middleware Pipeline provides asynchronous request interceptors supporting global and per-route execution chains.

## Next Topic

[Query Builder](file:///f:/ecf/docs/database/query-builder.md)

## Related Topics

- [HTTP Request](file:///f:/ecf/docs/http/requests.md)
- [HTTP Response](file:///f:/ecf/docs/http/responses.md)
