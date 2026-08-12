# `@ecfjs/http`

> **High-Performance HTTP Transport, Routing, Middleware & MVC Engine for ECF (Elegant Core Framework).**

[![Version](https://img.shields.io/badge/version-1.0.0--rc.1-blue.svg)](https://github.com/linkmewaseem/ECF-Elegant-Core-Framework)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](https://nodejs.org)

---

## Executive Summary

`@ecfjs/http` is the primary transport layer of the ECF framework. It provides an enterprise HTTP engine with:
1. **HttpKernel & HttpServer**: Modular HTTP kernel handling application bootstrapping, middleware pipelines, and server lifecycle.
2. **Request & Response Abstractions**: Rich input parsing, dot-notation accessors, type coercions, cookie parsing, content negotiation, proxy trusting, streaming, and file downloads.
3. **Advanced Routing Engine**: Radix/Trie-tree path matching, dynamic parameter extraction (`/users/{id}`), regex constraints, named routes, route groups, fallbacks, and RESTful resource routing.
4. **Middleware Pipeline**: Asynchronous onion-model pipeline supporting global, grouped, named, and terminating middleware hooks (`terminate`).
5. **Pluggable Body Parsers**: Built-in support for JSON, URL-encoded forms, multipart uploads, plain text, and raw binary buffers with payload size limits.
6. **MVC Layer**: Controllers, `ControllerResolver`, `ResourceController`, `FormRequest` validation integration, and Laravel-style `JsonResource` API transformers.
7. **Security & Performance**: Built-in rate limiting (`ThrottleRequests`), HTTP caching (`HttpCache`), `Gate`/`Policy` authorization, and HMAC-signed cookie jars.
8. **Multi-Adapter Support**: Native Node.js `http`/`http2`, Express, and Fastify adapter normalization.
9. **Testing Harness**: Fluent HTTP test suite (`HttpTestCase` & `TestResponse`).

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture & Request Processing Flow](#architecture--request-processing-flow)
- [1. HTTP Kernel (`HttpKernel`)](#1-http-kernel-httpkernel)
  - [1.1 Kernel Constructor & Injection](#11-kernel-constructor--injection)
  - [1.2 Application Bootstrapping (`bootstrap`)](#12-application-bootstrapping-bootstrap)
  - [1.3 Request Handling (`handle`)](#13-request-handling-handle)
  - [1.4 Global Middleware Stack (`use`)](#14-global-middleware-stack-use)
  - [1.5 Automatic Response Normalization (`normalizeResponse`)](#15-automatic-response-normalization-normalizeresponse)
  - [1.6 Terminating Middleware Execution (`terminateMiddleware`)](#16-terminating-middleware-execution-terminatemiddleware)
- [2. HTTP Server (`HttpServer`)](#2-http-server-httpserver)
  - [2.1 Server Lifecycle (`listen`, `close`, `address`)](#21-server-lifecycle-listen-close-address)
  - [2.2 Port & Host Guards](#22-port--host-guards)
  - [2.3 Fallback Error Handling (`handleUncaughtError`)](#23-fallback-error-handling-handleuncaughterror)
- [3. Request Engine (`Request`)](#3-request-engine-request)
  - [3.1 Basic Request Info & Headers](#31-basic-request-info--headers)
  - [3.2 Query Parameters & Route Params](#32-query-parameters--route-params)
  - [3.3 Cookie Extraction](#33-cookie-extraction)
  - [3.4 Lazy Asynchronous Body Parsing](#34-lazy-asynchronous-body-parsing)
  - [3.5 Unified Input Management (`all`, `input`, `only`, `except`, `has`, `filled`)](#35-unified-input-management-all-input-only-except-has-filled)
  - [3.6 Type Coercion Helpers (`boolean`, `integer`, `float`, `string`, `array`)](#36-type-coercion-helpers-boolean-integer-float-string-array)
  - [3.7 Method Inspection & Content Negotiation](#37-method-inspection--content-negotiation)
  - [3.8 Network, Security & Proxy Trusting](#38-network-security--proxy-trusting)
  - [3.9 File Upload Inspection](#39-file-upload-inspection)
  - [3.10 Schema Validation Integration (`validate`)](#310-schema-validation-integration-validate)
- [4. Response Engine (`Response`)](#4-response-engine-response)
  - [4.1 Status & Header Builders](#41-status--header-builders)
  - [4.2 Cookie Serialization (`cookie`, `clearCookie`)](#42-cookie-serialization-cookie-clearcookie)
  - [4.3 Cache Control & Security Headers](#43-cache-control--security-headers)
  - [4.4 Terminal Response Body Deliveries](#44-terminal-response-body-deliveries)
  - [4.5 Streams, Files & Download Deliveries](#45-streams-files--download-deliveries)
  - [4.6 Double-Send Safety Protections](#46-double-send-safety-protections)
- [5. Routing Subsystem](#5-routing-subsystem)
  - [5.1 Verb Binding Methods](#51-verb-binding-methods)
  - [5.2 Dynamic Route Parameters & Regex Constraints](#52-dynamic-route-parameters--regex-constraints)
  - [5.3 Named Routes & URL Generation](#53-named-routes--url-generation)
  - [5.4 Route Groups & Prefixes](#54-route-groups--prefixes)
  - [5.5 RESTful Resource Routes](#55-restful-resource-routes)
  - [5.6 Fallback Routes](#56-fallback-routes)
  - [5.7 High-Performance Trie Router (`TrieRouter`)](#57-high-performance-trie-router-trierouter)
  - [5.8 Route Model Binding (`ModelBinder`)](#58-route-model-binding-modelbinder)
- [6. Middleware System](#6-middleware-system)
  - [6.1 Asynchronous Onion Pipeline (`Pipeline`)](#61-asynchronous-onion-pipeline-pipeline)
  - [6.2 `MiddlewareRegistry` (Global, Named, Groups)](#62-middlewareregistry-global-named-groups)
  - [6.3 `MiddlewareResolver`](#63-middlewareresolver)
  - [6.4 Terminating Middleware Lifecycle](#64-terminating-middleware-lifecycle)
- [7. Pluggable Body Parsers](#7-pluggable-body-parsers)
- [8. MVC & API Layer](#8-mvc--api-layer)
  - [8.1 Base Controllers & Resolution](#81-base-controllers--resolution)
  - [8.2 Form Request Validation](#82-form-request-validation)
  - [8.3 API Resources & Collections](#83-api-resources--collections)
- [9. Security, Rate Limiting & Auth](#9-security-rate-limiting--auth)
  - [9.1 Rate Limiting (`ThrottleRequests`)](#91-rate-limiting-throttlerequests)
  - [9.2 Authorization (`Gate` & `Policy`)](#92-authorization-gate--policy)
  - [9.3 CookieJar & Session Storage](#93-cookiejar--session-storage)
- [10. HTTP Testing Harness (`HttpTestCase` & `TestResponse`)](#10-http-testing-harness-httptestcase--testresponse)
- [11. Exception Handling & HTTP Error Hierarchy](#11-exception-handling--http-error-hierarchy)
- [12. Full End-to-End Enterprise REST API Example](#12-full-end-to-end-enterprise-rest-api-example)
- [13. Troubleshooting & FAQs](#13-troubleshooting--faqs)

---

## Installation

```bash
pnpm add @ecfjs/http @ecfjs/core
# or
npm install @ecfjs/http @ecfjs/core
```

---

## Quick Start

```javascript
import { Application, Facade } from "@ecfjs/core";
import { HttpServiceProvider, HttpServer, Route } from "@ecfjs/http";

// 1. Initialize Application Container
const app = new Application();
app.register(HttpServiceProvider);
app.boot();
Facade.setApplication(app);

// 2. Define Routes using Static Route Facade
Route.get("/health", (req, res) => {
    return res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

Route.get("/users/{id}", (req, res) => {
    const id = req.param("id");
    return res.json({ id: Number(id), name: "Alice" });
});

// 3. Launch HTTP Server via Application Listen Shortcut
app.listen(3000, () => {
    console.log("ECF HTTP Server running on http://localhost:3000");
});
```

---

## Architecture & Request Processing Flow

```
Raw HTTP Request (IncomingMessage, ServerResponse)
                     │
                     ▼
             HttpServer.listen()
                     │
                     ▼
             HttpKernel.handle()
                     │
          (Bootstrap Application)
                     │
                     ▼
        Construct Request & Response
                     │
                     ▼
     Execute Global Middleware Pipeline
                     │
                     ▼
           Router.match(request)
                     │
                     ▼
       Resolve Route-Level Middleware
                     │
                     ▼
      Execute Route Middleware Pipeline
                     │
                     ▼
          Execute Route Handler
                     │
                     ▼
       Normalize Controller Return Value
                     │
                     ▼
           Send HTTP Response
                     │
                     ▼
   Execute Terminating Middleware (.terminate())
```

---

## 1. HTTP Kernel (`HttpKernel`)

The `HttpKernel` class (`src/HttpKernel.js`) orchestrates the request execution pipeline.

### 1.1 Kernel Constructor & Injection

`HttpKernel` requires four primary dependencies injected via constructor:

```javascript
import { HttpKernel } from "@ecfjs/http";

const kernel = new HttpKernel(
    router,               // Object with match(request) method
    bodyParserManager,    // Object with parse(request) method
    middlewareResolver,   // Object with resolve(route) method
    exceptionHandler,     // Optional object with handle(error, req, res) method
    responseContext,      // Optional context object passed to Response
    app                   // Optional Application instance
);
```

### 1.2 Application Bootstrapping (`bootstrap`)

`kernel.bootstrap()` guarantees that `app.boot()` runs exactly once before processing the first request:

```javascript
await kernel.bootstrap();
console.log(kernel.isBootstrapped); // true
```

### 1.3 Request Handling (`handle`)

The main entrypoint for Node.js HTTP servers:

```javascript
const response = await kernel.handle(rawRequest, rawResponse);
```

1. Calls `bootstrap()`.
2. Wraps raw Node objects into `@ecfjs/http` `Request` and `Response` instances.
3. Chains Global Middleware -> Router Match -> Route Middleware -> Route Handler.
4. Normalizes return values into standard responses.
5. Invokes terminating hooks.
6. Catches uncaught exceptions and delegates to `exceptionHandler`.

### 1.4 Global Middleware Stack (`use`)

Registers middleware functions running on every single HTTP request before route resolution:

```javascript
kernel.use(async (req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    await next();
});
```

### 1.5 Automatic Response Normalization (`normalizeResponse`)

`HttpKernel` normalizes any return value from a route closure or controller into a standard `Response`:

| Route Return Type | Behavior | Content-Type Header |
|---|---|---|
| `Response` instance | Passed through unchanged | Preserved |
| `string` | Converted via `res.html(str)` | `text/html; charset=utf-8` |
| `Buffer` | Converted via `res.send(buf)` | Preserved or auto-detected |
| `Object` (Plain) | Converted via `res.json(obj)` | `application/json; charset=utf-8` |
| `Object` with `.render()` | Calls `await obj.render()` -> `res.html()` | `text/html; charset=utf-8` |

### 1.6 Terminating Middleware Execution (`terminateMiddleware`)

After the response payload is transmitted to the client, `HttpKernel` checks all executed middleware for a `terminate(request, response)` method and runs them asynchronously without delaying response delivery:

```javascript
class AuditMiddleware {
    async handle(req, res, next) {
        await next();
    }

    async terminate(req, res) {
        // Runs AFTER client receives response!
        await logToAuditDatabase(req.path, res.statusCode);
    }
}
```

---

## 2. HTTP Server (`HttpServer`)

`HttpServer` (`src/HttpServer.js`) wraps Node's native `http.createServer`.

### 2.1 Server Lifecycle (`listen`, `close`, `address`)

```javascript
import { HttpServer } from "@ecfjs/http";

const server = new HttpServer(kernel);

// Start listening
server.listen(3000, "127.0.0.1", () => {
    console.log("Listening on 127.0.0.1:3000");
});

console.log(server.listening); // true
console.log(server.address()); // { address: '127.0.0.1', family: 'IPv4', port: 3000 }

// Close server gracefully
server.close(() => {
    console.log("Server stopped");
});
```

### 2.2 Port & Host Guards

- Ports must be integers between `0` and `65535`. Out-of-range ports throw `HttpServerError`.
- Calling `listen()` on an already listening server throws `HttpServerError("Server is already listening.")`.
- Calling `close()` on a non-listening server throws `HttpServerError("Cannot close a server that is not listening.")`.

### 2.3 Fallback Error Handling (`handleUncaughtError`)

If an error escapes `HttpKernel` without an `exceptionHandler`, `HttpServer` prevents node crash:
- Uncaught `RouteNotFoundError` -> Responds with HTTP `404 Not Found`.
- Generic exceptions -> Responds with HTTP `500 Internal Server Error`.

---

## 3. Request Engine (`Request`)

`Request` (`src/Request.js`) wraps Node's `http.IncomingMessage`.

### 3.1 Basic Request Info & Headers

```javascript
req.method;         // "POST"
req.url;            // "/api/users?page=2"
req.path;           // "/api/users"
req.headers;        // Frozen headers object

req.header("content-type"); // "application/json" (Case-insensitive)
req.hasHeader("authorization"); // true/false
```

### 3.2 Query Parameters & Route Params

```javascript
// Query string (e.g. ?search=john&sort=asc)
const search = req.query("search", "default_val");
const allQuery = req.query(); // { search: "john", sort: "asc" }

// Route parameters (set by router, e.g. /users/{id})
const id = req.param("id");
const params = req.params; // { id: "42" }
```

### 3.3 Cookie Extraction

```javascript
req.cookies;                 // { session_id: "xyz123" }
req.cookie("session_id");    // "xyz123"
req.hasCookie("session_id"); // true
```

### 3.4 Lazy Asynchronous Body Parsing

Body parsing is executed lazily on demand when calling `await req.body()`:

```javascript
const body = await req.body();
```

### 3.5 Unified Input Management (`all`, `input`, `only`, `except`, `has`, `filled`)

Unified input merges route parameters, query string data, and parsed request body into a single input interface:

```javascript
// Retrieve merged payload object
const inputs = await req.all();

// Retrieve key with dot-notation lookup support
const email = await req.input("user.email", "fallback@example.com");

// Pick subset of inputs
const credentials = await req.only("username", "password");

// Exclude sensitive keys
const safeInputs = await req.except("password", "credit_card");

// Input presence checks
await req.has("email");        // true if present and non-null
await req.hasAny("name", "id"); // true if any key is present
await req.filled("username");  // true if present, non-null, and non-empty string/array/object
await req.missing("legacy_id");// true if key is absent
```

### 3.6 Type Coercion Helpers (`boolean`, `integer`, `float`, `string`, `array`)

Safely coerce input variables to exact scalar types:

```javascript
const isActive = await req.boolean("is_active"); // "true", 1, "yes", "on" -> true
const age      = await req.integer("age", 18);    // "25" -> 25
const price    = await req.float("price", 0.0);   // "19.99" -> 19.99
const name     = await req.string("name");        // 123 -> "123"
const tags     = await req.array("tags");         // "js" -> ["js"], ["a", "b"] -> ["a", "b"]
```

### 3.7 Method Inspection & Content Negotiation

```javascript
req.isGet();    // true if method is GET
req.isPost();   // true if method is POST
req.isMethod("PATCH");

req.accepts("json");         // true if Accept header accepts JSON
req.prefers(["json", "html"]);// Returns preferred MIME choice
req.expectsJson();           // true for AJAX / JSON Accept headers
req.ajax();                  // true if X-Requested-With === XMLHttpRequest
req.pjax();                  // true if X-PJAX header is present
req.prefetch();              // true if Purpose header === prefetch
```

### 3.8 Network, Security & Proxy Trusting

Configure reverse proxy trust (Nginx, Cloudflare, AWS ALB):

```javascript
req.setTrustProxy(true);

req.ip;       // Evaluates CF-Connecting-IP, X-Forwarded-For, X-Real-IP
req.ips;      // Array of proxy IPs in X-Forwarded-For chain
req.protocol; // "https" or "http"
req.secure;   // true if TLS or X-Forwarded-Proto === https
req.host;     // "api.example.com"
req.origin;   // "https://api.example.com"
req.userAgent;// User-Agent string
```

### 3.9 File Upload Inspection

```javascript
const files = await req.files();
const avatar = await req.file("avatar"); // Returns UploadedFile descriptor object
```

### 3.10 Schema Validation Integration (`validate`)

Runs validation using `@ecfjs/validation`:

```javascript
const validated = await req.validate({
    name: "required|string|min:3",
    email: "required|email",
    age: "numeric|min:18"
});
// Throws ValidationException(422) automatically if rules fail!
```

---

## 4. Response Engine (`Response`)

`Response` (`src/Response.js`) wraps Node's `http.ServerResponse`.

### 4.1 Status & Header Builders

Method-chainable response configuration:

```javascript
res.status(201)
   .header("X-Custom-Header", "Value")
   .contentType("json");
```

### 4.2 Cookie Serialization (`cookie`, `clearCookie`)

```javascript
res.cookie("session_token", "abc123secret", {
    maxAge: 3600 * 24, // 1 day in seconds
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/"
});

// Delete cookie
res.clearCookie("session_token");
```

### 4.3 Cache Control & Security Headers

```javascript
// Set Cache-Control header directives
res.cacheControl({ public: true, maxAge: 86400, mustRevalidate: true });

// Prevent client/proxy caching completely
res.noCache();

// Set ETag & Last-Modified
res.etag("v1.2.3");
res.lastModified(new Date());
res.vary("Accept-Encoding");
```

### 4.4 Terminal Response Body Deliveries

These methods serialize payload content and transmit headers to the wire:

```javascript
res.json({ success: true, data: [] }, 200);
res.html("<h1>Hello World</h1>", 200);
res.text("Plain text content", 200);
res.noContent(204); // Sends empty payload with status 204
res.redirect("/login", 302);
```

### 4.5 Streams, Files & Download Deliveries

```javascript
// Stream a Node.js Readable stream directly to client
await res.stream(readableStream);

// Force file download response with Content-Disposition header
await res.download("/path/to/report.pdf", "Monthly_Report.pdf");
```

### 4.6 Double-Send Safety Protections

Attempting to send headers or body payload twice throws `ResponseError("Headers already sent.")`.

---

## 5. Routing Subsystem

### 5.1 Verb Binding Methods

The `Router` (`src/Router.js`) supports all standard HTTP verbs:

```javascript
import { Route } from "@ecfjs/http";

Route.get("/users", handler);
Route.post("/users", handler);
Route.put("/users/{id}", handler);
Route.patch("/users/{id}", handler);
Route.delete("/users/{id}", handler);
Route.options("/users", handler);
Route.head("/users", handler);

// Match multiple verbs
Route.match(["GET", "POST"], "/submit", handler);

// Match any verb
Route.any("/webhook", handler);
```

### 5.2 Dynamic Route Parameters & Regex Constraints

```javascript
Route.get("/posts/{category}/{slug}", (req, res) => {
    const category = req.param("category");
    const slug = req.param("slug");
    return res.json({ category, slug });
}).where("category", "[a-z]+").where("slug", "[a-z0-9-]+");
```

### 5.3 Named Routes & URL Generation

```javascript
Route.get("/users/{id}", handler).name("users.show");

// Build URL programmatically using router
const router = app.make("router");
const url = router.url("users.show", { id: 42 }, { page: 1 });
// Result: "/users/42?page=1"
```

### 5.4 Route Groups & Prefixes

Nest routes under shared prefixes and middleware chains:

```javascript
Route.group({ prefix: "/api/v1", middleware: ["auth"] }, () => {
    Route.get("/profile", profileHandler);
    
    Route.group({ prefix: "/admin", middleware: ["admin"] }, () => {
        Route.get("/metrics", metricsHandler);
    });
});
```

### 5.5 RESTful Resource Routes

Automatically generates 7 standard CRUD routes for a resource controller:

```javascript
Route.resource("photos", "PhotoController");
// Generates:
// GET     /photos          -> PhotoController@index   (photos.index)
// GET     /photos/create   -> PhotoController@create  (photos.create)
// POST    /photos          -> PhotoController@store   (photos.store)
// GET     /photos/{id}     -> PhotoController@show    (photos.show)
// GET     /photos/{id}/edit-> PhotoController@edit    (photos.edit)
// PUT     /photos/{id}     -> PhotoController@update  (photos.update)
// DELETE  /photos/{id}     -> PhotoController@destroy (photos.destroy)

// API Resource (Excludes create & edit forms):
Route.apiResource("posts", "PostController");
```

### 5.6 Fallback Routes

Catches any unmatched incoming request path:

```javascript
Route.fallback((req, res) => {
    return res.status(404).json({ error: "Endpoint not found" });
});
```

### 5.7 High-Performance Trie Router (`TrieRouter`)

`TrieRouter` (`src/routing/TrieRouter.js`) uses an internal prefix radix-tree (`TrieNode`) to perform $O(K)$ parameter extraction and path resolution where $K$ is the path segment depth.

### 5.8 Route Model Binding (`ModelBinder`)

`ModelBinder` automatically resolves database models for matching route parameters before invoking controller actions.

---

## 6. Middleware System

### 6.1 Asynchronous Onion Pipeline (`Pipeline`)

`Pipeline` (`src/Pipeline.js`) executes middleware sequentially in onion layers:

```javascript
import { Pipeline } from "@ecfjs/http";

const result = await new Pipeline()
    .send(req, res)
    .through([middleware1, middleware2])
    .then(async (request, response) => {
        return "Final Controller Output";
    });
```

### 6.2 `MiddlewareRegistry` (Global, Named, Groups)

Register named middleware aliases and groups in container:

```javascript
import { MiddlewareRegistry } from "@ecfjs/http";

// Named alias
MiddlewareRegistry.alias("auth", AuthMiddleware);

// Middleware group
MiddlewareRegistry.group("web", [
    CookieMiddleware,
    SessionMiddleware
]);
```

### 6.3 `MiddlewareResolver`

Resolves string names (e.g. `"auth"`, `"web"`) into concrete middleware executable pipelines.

### 6.4 Terminating Middleware Lifecycle

Middleware implementing `terminate(request, response)` automatically run after response dispatch.

---

## 7. Pluggable Body Parsers

`BodyParserManager` (`src/BodyParserManager.js`) delegates parsing based on `Content-Type`:

- `JsonBodyParser`: Parses `application/json`. Throws `InvalidJsonError` on malformed JSON.
- `FormBodyParser`: Parses `application/x-www-form-urlencoded` and `multipart/form-data`.
- `TextBodyParser`: Parses `text/plain`.
- `RawBodyParser`: Reads raw binary `Buffer`.

Maximum body size protection throws `PayloadTooLargeError` if content exceeds configured limits.

---

## 8. MVC & API Layer

### 8.1 Base Controllers & Resolution

```javascript
import { Controller } from "@ecfjs/http";

export class UserController extends Controller {
    async show(req, res) {
        const id = req.param("id");
        return res.json({ id, name: "Alice" });
    }
}
```

### 8.2 Form Request Validation

Extend `FormRequest` (`src/validation/FormRequest.js`) to decouple validation rules from controller actions:

```javascript
import { FormRequest } from "@ecfjs/http";

export class StoreUserRequest extends FormRequest {
    authorize() {
        return true; // Return false to throw ForbiddenException(403)
    }

    rules() {
        return {
            name: "required|string|min:3",
            email: "required|email"
        };
    }
}
```

### 8.3 API Resources & Collections

Transform models into clean JSON responses using `JsonResource` and `ResourceCollection`:

```javascript
import { JsonResource, ResourceCollection } from "@ecfjs/http";

export class UserResource extends JsonResource {
    toArray(req) {
        return {
            id: this.resource.id,
            fullName: this.resource.name,
            emailAddress: this.resource.email
        };
    }
}

// In Controller:
return new UserResource(user);
// Or collection:
return new UserResourceCollection(users);
```

---

## 9. Security, Rate Limiting & Auth

### 9.1 Rate Limiting (`ThrottleRequests`)

Attaches rate limiting to routes. Sets HTTP response headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `Retry-After` (when throttled)

Exceeding the rate limit throws `RateLimitException` (HTTP 429).

### 9.2 Authorization (`Gate` & `Policy`)

Define user permissions:

```javascript
import { Gate } from "@ecfjs/http";

Gate.define("update-post", (user, post) => {
    return user.id === post.userId;
});

if (Gate.denies("update-post", post)) {
    throw new ForbiddenException("Unauthorized post edit");
}
```

### 9.3 CookieJar & Session Storage

- `CookieJar`: Handles encrypted / HMAC-signed cookies.
- `SessionStore`: Flash message lifecycle and session attribute management.

---

## 10. HTTP Testing Harness (`HttpTestCase` & `TestResponse`)

Write expressively fluent integration tests for your HTTP endpoints:

```javascript
import { HttpTestCase } from "@ecfjs/http";

class UserApiTest extends HttpTestCase {
    async testGetUserProfile() {
        const response = await this.get("/api/users/1");

        response.assertStatus(200)
                .assertJson({ id: 1, name: "Alice" })
                .assertHeader("content-type", "application/json; charset=utf-8");
    }
}
```

---

## 11. Exception Handling & HTTP Error Hierarchy

All HTTP exceptions derive from `HttpException` (`src/exceptions/HttpException.js`):

```
HttpException (statusCode, message)
 ├── BadRequestException (400)
 ├── UnauthorizedException (401)
 ├── ForbiddenException (403)
 ├── NotFoundException (404)
 ├── MethodNotAllowedException (405)
 ├── CsrfException (419)
 ├── ValidationException (422)
 ├── RateLimitException (429)
 ├── InternalServerException (500)
 └── ServiceUnavailableException (503)
```

---

## 12. Full End-to-End Enterprise REST API Example

```javascript
import { Application, ServiceProvider, Facade } from "@ecfjs/core";
import {
    HttpServiceProvider,
    HttpServer,
    Route,
    Controller,
    FormRequest,
    JsonResource,
    MiddlewareRegistry
} from "@ecfjs/http";

// 1. Define Form Request Validator
class CreateProductRequest extends FormRequest {
    rules() {
        return {
            title: "required|string|min:3",
            price: "required|numeric|min:0.01"
        };
    }
}

// 2. API Resource Transformer
class ProductResource extends JsonResource {
    toArray(req) {
        return {
            id: this.resource.id,
            title: this.resource.title,
            formattedPrice: `$${this.resource.price.toFixed(2)}`
        };
    }
}

// 3. Product Controller
class ProductController extends Controller {
    static db = [
        { id: 1, title: "Laptop", price: 999.99 },
        { id: 2, title: "Mouse", price: 29.99 }
    ];

    async index(req, res) {
        return res.json(ProductController.db.map(p => new ProductResource(p).toArray(req)));
    }

    async store(req, res) {
        const validated = await req.validate(new CreateProductRequest().rules());
        const product = { id: Date.now(), ...validated };
        ProductController.db.push(product);
        return res.status(201).json(new ProductResource(product).toArray(req));
    }

    async show(req, res) {
        const id = req.integer("id");
        const product = ProductController.db.find(p => p.id === id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        return res.json(new ProductResource(product).toArray(req));
    }
}

// 4. Application Bootstrap
const app = new Application();
app.register(HttpServiceProvider);
app.boot();
Facade.setApplication(app);

// 5. Register Middleware
MiddlewareRegistry.global(async (req, res, next) => {
    res.header("X-Framework", "ECF");
    await next();
});

// 6. Define Routes
Route.group({ prefix: "/api/v1" }, () => {
    Route.get("/products", [ProductController, "index"]);
    Route.post("/products", [ProductController, "store"]);
    Route.get("/products/{id}", [ProductController, "show"]);
});

// 7. Start HTTP Server
app.listen(3000, () => {
    console.log("Enterprise REST API running on http://localhost:3000");
});
```

---

## 13. Troubleshooting & FAQs

### 1. `RouteNotFoundError: Route GET /path not found`
- **Cause**: No route was registered matching the method and URL path.
- **Solution**: Verify route definition verb and path string, or add a `Route.fallback()` handler.

### 2. `ResponseError: Headers already sent.`
- **Cause**: Attempting to invoke `res.json()`, `res.send()`, or `res.header()` after headers have already been dispatched.
- **Solution**: Ensure your route closures return once after calling a terminal response method.

### 3. `ValidationException (422 Unprocessable Entity)`
- **Cause**: Incoming request payload failed schema validation rules inside `req.validate()`.
- **Solution**: Inspect request payload or catch `ValidationException` in `HttpExceptionHandler`.

---

## License

[MIT](LICENSE)

