# HTTP Routing

## Introduction

The HTTP Router maps incoming HTTP request URLs and HTTP methods (GET, POST, PUT, DELETE, etc.) to specific closure handlers or controllers.

## Why use it?

Manual URL parsing using raw Node.js `http` primitives is tedious and error-prone. The ECF Router provides clear route definitions, route parameter extraction, regex parameter constraints, middleware attachment, and route grouping.

## Syntax

```js
import { Route } from "@ecf/http";

// Basic HTTP verb route registration
Route.get(path, handler);
Route.post(path, handler);
Route.put(path, handler);
Route.patch(path, handler);
Route.delete(path, handler);

// Parametric route with constraint
Route.get("/users/{id}", handler).where("id", "[0-9]+");
```

## Example

```js
import { Application, Facade, HttpServiceProvider, Route } from "@ecf/http";

const app = new Application();
app.register(HttpServiceProvider);
app.boot();
Facade.setApplication(app);

// 1. Basic static route
Route.get("/health", (req, res) => {
    return res.json({ status: "OK" });
});

// 2. Route with dynamic parameters and regex constraints
Route.get("/users/{id}", (req, res) => {
    const { id } = req.params;
    return res.json({ userId: id });
}).where("id", "[0-9]+").name("users.show");

// 3. POST route with body handler
Route.post("/users", async (req, res) => {
    const data = await req.body();
    return res.status(201).json({ created: true, user: data });
});

// 4. Route Grouping with prefix and middleware
Route.group({ prefix: "/api/v1" }, () => {
    Route.get("/orders", (req, res) => {
        return res.json({ orders: [] });
    });
});
```

## How it Works

1. **Path Compilation**: Route path patterns like `/users/{id}` are compiled into regular expressions (`^\/users\/([^/]+)$`). Parameter names (`["id"]`) are extracted into an array.
2. **Matching Engine**: When a request arrives, `Router.match(method, path)` filters candidate routes by HTTP verb and test path.
3. **Regex Constraints (`.where()`)**: Replaces standard segment wildcard matching with custom regular expression patterns (e.g. `[0-9]+` ensures `/users/abc` will fail to match).

## Parameters

### `Route.get(path, handler)` / `post()` / `put()` / `patch()` / `delete()`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `path` | `string` | The URI path pattern to match. |
| `handler` | `Function` | Request handler callback receiving `(req, res)`. |

### `where(nameOrObject, pattern = null)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `nameOrObject` | `string \| object` | Parameter name or key-value map of parameter patterns. |
| `pattern` | `string \| RegExp` | Regex pattern string or RegExp object for parameter validation. |

### `name(routeName)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `routeName` | `string` | Unique string alias for the route. |

### `middleware(...mw)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `...mw` | `Function[]` | Middleware functions or array of middleware functions to execute for this route. |

## Return Value

Route registration calls return the `Route` instance, enabling fluent method chaining (`.where()`, `.name()`, `.middleware()`).

## Notes

> [!NOTE]
> Route paths support multiple parameters per segment: `/posts/{postId}/comments/{commentId}`.

> [!WARNING]
> Duplicate route definitions with identical paths and HTTP methods will throw a `DuplicateRouteError`.

## Best Practices

- Use dynamic parameters `{id}` instead of raw query string parsing for resource identifiers.
- Constrain dynamic numeric IDs using `.where("id", "[0-9]+")`.
- Assign route names (`.name("api.users.show")`) for easy reference.

## Common Mistakes

- **Forgetting leading slash**: Defining route paths as `"users"` instead of `"/users"`.

## Tips

- Group related routes using `Route.group({ prefix: "/admin", middleware: [auth] }, callback)`.

## Related Features

- [HTTP Request](file:///f:/ecf/docs/http/requests.md)
- [HTTP Response](file:///f:/ecf/docs/http/responses.md)
- [Middleware & Pipeline](file:///f:/ecf/docs/http/middleware.md)

---

## Summary

The HTTP Router provides dynamic path matching, regex constraints, fluent middleware chaining, and route naming.

## Next Topic

[HTTP Requests](file:///f:/ecf/docs/http/requests.md)

## Related Topics

- [HTTP Responses](file:///f:/ecf/docs/http/responses.md)
- [Middleware Pipeline](file:///f:/ecf/docs/http/middleware.md)
