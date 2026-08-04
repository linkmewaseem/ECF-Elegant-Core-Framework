# `@ecf/http` — HTTP Transport Layer

`@ecf/http` is the high-performance HTTP transport layer for the ECF (Elegant Core Framework) ecosystem — routing, middleware, request/response handling, and server lifecycle.

---

## Features

- **Router** & **TrieRouter** — static and dynamic route matching (`/users/{id}`)
- **Request** / **Response** — parsed URL, query, headers, cookies, params, body, IP
- **Middleware Pipeline** — composable per-request middleware chain
- **HttpKernel** — ties router + middleware + body parser into a single handler
- **HttpServer** — wraps Node.js `http.createServer`
- **Multi-Adapter** — Native, Express, and Fastify adapter support
- **FormRequest** — validation integration via `@ecf/validation`
- **Rate Limiting**, **HTTP Cache**, **Content Negotiation**
- **HttpTestCase** — HTTP testing harness

---

## Quick Start

### 1. Bootstrap HTTP Stack

```javascript
import { Application } from "@ecf/core";
import { HttpServiceProvider, HttpServer, Route } from "@ecf/http";

const app = new Application();
app.register(HttpServiceProvider);
app.boot();

Route.get("/health", (req, res) => res.json({ status: "ok" }));

const server = new HttpServer(app);
server.listen(3000, () => console.log("Listening on :3000"));
```

### 2. Middleware

```javascript
import { MiddlewareRegistry } from "@ecf/http";

MiddlewareRegistry.global(async (ctx, next) => {
  console.log(`${ctx.request.method()} ${ctx.request.path()}`);
  await next();
});
```

### 3. Dynamic Routes

```javascript
import { Route } from "@ecf/http";

Route.get("/users/{id}", (req, res) => {
  const id = req.param("id");
  return res.json({ id });
});
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — package architecture and dependencies
- [BENCHMARKS.md](./BENCHMARKS.md) — routing and middleware performance SLAs

---

## License

MIT
