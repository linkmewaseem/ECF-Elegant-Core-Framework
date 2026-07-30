# HTTP Responses

## Introduction

The `Response` class handles building and returning outgoing HTTP responses, managing status codes, headers, cookies, content types, redirects, and response bodies.

## Why use it?

Node's native `http.ServerResponse` requires manual `setHeader` calls, status code setters, and explicit `end()` stream calls. ECF `Response` provides chainable methods like `res.status(201).json(data)`.

## Syntax

```js
Route.get("/example", (req, res) => {
    // Send JSON response with 200 OK
    return res.json({ success: true });

    // Send HTML response with custom status code
    return res.status(201).html("<h1>Created</h1>");

    // Redirect user to another URL
    return res.redirect("/login");
});
```

## Example

```js
import { Route } from "@ecf/http";

// 1. Fluent status code and JSON response
Route.post("/api/items", (req, res) => {
    return res
        .status(201)
        .header("X-Custom-Header", "ECF-Framework")
        .json({ id: 101, name: "New Item" });
});

// 2. HTML template response
Route.get("/welcome", (req, res) => {
    return res.html("<h1>Welcome to ECF</h1><p>Enjoy building web apps!</p>");
});

// 3. Redirect response with HTTP 302
Route.get("/old-dashboard", (req, res) => {
    return res.redirect("/new-dashboard", 302);
});

// 4. Setting response cookie
Route.get("/set-session", (req, res) => {
    return res
        .cookie("sessionId", "xyz123", { httpOnly: true, maxAge: 3600 })
        .json({ sessionSet: true });
});
```

## How it Works

1. **Fluent Staging**: Calling `res.status(404)` or `res.header("X-Key", "Value")` mutates internal response metadata and returns `res` (`this`) for method chaining.
2. **Payload Output**: Calling terminal output methods (`.json()`, `.html()`, `.text()`, `.redirect()`) automatically sets appropriate `Content-Type` and `Content-Length` headers and writes the payload to Node's native response stream.

## Methods Table

### `status(code)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `code` | `number` | The HTTP status code (e.g. `200`, `201`, `404`, `500`). |

### `json(data)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `data` | `any` | Object or array serialized to JSON string via `JSON.stringify()`. |

### `html(content)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `content` | `string` | HTML markup string to send. |

### `text(content)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `content` | `string` | Plain text string to send. |

### `redirect(url, status = 302)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `url` | `string` | Redirect target URI. |
| `status` | `number` | HTTP status code for redirection (`301` or `302`). Defaults to `302`. |

### `header(name, value)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `name` | `string` | HTTP response header key. |
| `value` | `string` | HTTP response header value. |

## Return Value

- `status()`, `header()`, and `cookie()` return the `Response` instance for method chaining.
- `json()`, `html()`, `text()`, and `redirect()` return the sent `Response` instance.

## Notes

> [!NOTE]
> `res.json()` automatically adds header `Content-Type: application/json`.

> [!WARNING]
> Attempting to call output methods (`.json()`, `.send()`) twice on the same response object will raise a `ResponseError` indicating headers have already been sent.

## Best Practices

- Always return response calls from route handlers: `return res.json(...)`.
- Use correct HTTP status codes (`201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`).

## Common Mistakes

- **Forgetting `return`**: Executing code after `res.json(...)` without returning the response function call.

## Tips

- You can set cookies with security flags using `res.cookie("name", "val", { httpOnly: true, secure: true })`.

## Related Features

- [HTTP Request](file:///f:/ecf/docs/http/requests.md)
- [HTTP Routing](file:///f:/ecf/docs/http/routing.md)

---

## Summary

The `Response` class simplifies returning JSON, HTML, text, redirects, cookies, and HTTP headers with clean method chaining.

## Next Topic

[Middleware Pipeline](file:///f:/ecf/docs/http/middleware.md)

## Related Topics

- [HTTP Request](file:///f:/ecf/docs/http/requests.md)
- [HTTP Routing](file:///f:/ecf/docs/http/routing.md)
