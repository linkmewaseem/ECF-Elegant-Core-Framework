# HTTP Requests

## Introduction

The `Request` class encapsulates incoming HTTP request data including URL paths, query parameters, route parameters, headers, cookies, client IP addresses, and request bodies.

## Why use it?

Node's native `http.IncomingMessage` stream requires tedious manual buffer reading for POST bodies and manual parsing for cookies and query parameters. The ECF `Request` object exposes clean, async, ready-to-use properties and helper methods.

## Syntax

```js
Route.post("/users/{id}", async (req, res) => {
    // Access route dynamic params
    const { id } = req.params;

    // Access query parameters
    const page = req.query.page || 1;

    // Parse request body asynchronously
    const bodyData = await req.body();

    // Access specific header
    const authHeader = req.header("authorization");
});
```

## Example

```js
import { Route } from "@ecf/http";

Route.post("/posts/{id}/comments", async (req, res) => {
    // 1. Path parameter
    const postId = req.params.id;

    // 2. Query string parameter (?notify=true)
    const shouldNotify = req.query.notify === "true";

    // 3. Client IP address
    const clientIp = req.ip();

    // 4. Request header
    const token = req.header("Authorization", "Bearer default_token");

    // 5. Asynchronously parse JSON body payload
    const data = await req.body();

    return res.status(201).json({
        postId,
        comment: data.comment,
        shouldNotify,
        clientIp,
        token
    });
});
```

## How it Works

1. **Parameter Resolution**: When a route matches, `Router` injects dynamic path variables into `req.params`.
2. **Asynchronous Body Parsing**: Calling `await req.body()` streams raw request data buffers from Node's socket, inspects the `Content-Type` header, and parses `application/json` or `application/x-www-form-urlencoded` payloads automatically.
3. **Attribute Storage**: Middleware can store transient per-request state on `req.attributeBag.set("user", authenticatedUser)` to pass contextual data to route handlers.

## Properties & Methods

### `params`

| Property | Type | Description |
| -------- | ---- | ----------- |
| `params` | `object` | Key-value dictionary of dynamic route path parameters. |

### `query`

| Property | Type | Description |
| -------- | ---- | ----------- |
| `query` | `object` | Key-value dictionary of URL query string parameters. |

### `headers` / `header(name, defaultValue)`

| Method / Property | Type | Description |
| ----------------- | ---- | ----------- |
| `header(name, default)` | `Function` | Case-insensitive lookup for an HTTP header value. |

### `cookies` / `cookie(name, defaultValue)`

| Method / Property | Type | Description |
| ----------------- | ---- | ----------- |
| `cookie(name, default)` | `Function` | Lookup for parsed request cookie values. |

### `body()`

| Method | Type | Description |
| ------ | ---- | ----------- |
| `body()` | `AsyncFunction` | Resolves the parsed request body payload. |

### `ip()`

| Method | Type | Description |
| ------ | ---- | ----------- |
| `ip()` | `Function` | Returns the client IP string, accounting for proxy header overrides (`X-Forwarded-For`). |

## Return Value

- `req.body()` returns a Promise resolving to `object`, `string`, or `null`.
- `req.header()` and `req.cookie()` return `string` or `defaultValue`.
- `req.ip()` returns a `string`.

## Notes

> [!NOTE]
> `req.body()` caches the parsed body result on the request instance so subsequent calls return immediately without re-reading the stream.

> [!TIP]
> Use `req.isJson()` to check whether the incoming request sent an `application/json` content type.

## Best Practices

- Always `await` calls to `req.body()` inside `async` route handlers.
- Use `req.attributeBag` to transfer authenticated user data from auth middleware to route handlers.

## Common Mistakes

- **Forgetting `await` on `req.body()`**: Calling `req.body()` synchronously will return a `Promise` object rather than the parsed JSON data.

## Tips

- You can set custom request attributes in middleware: `req.attributeBag.set("userId", 42)`.

## Related Features

- [HTTP Response](file:///f:/ecf/docs/http/responses.md)
- [HTTP Routing](file:///f:/ecf/docs/http/routing.md)
- [Middleware & Pipeline](file:///f:/ecf/docs/http/middleware.md)

---

## Summary

The `Request` class streamlines reading HTTP headers, cookies, query parameters, route parameters, IP addresses, and request bodies.

## Next Topic

[HTTP Responses](file:///f:/ecf/docs/http/responses.md)

## Related Topics

- [HTTP Routing](file:///f:/ecf/docs/http/routing.md)
- [Middleware Pipeline](file:///f:/ecf/docs/http/middleware.md)
