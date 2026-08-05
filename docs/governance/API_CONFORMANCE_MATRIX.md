# ECF — API Conformance Matrix

This document defines the **fluent API conventions** that all ECF packages must follow for methods like `use()`, `fake()`, `extend()`, `driver()`, `channel()`, `model()`, `make()`, `register()`, and `boot()`.

---

## Core Lifecycle Methods

| Method | Package | Signature | Return Type | Description |
|---|---|---|---|---|
| `register()` | `@ecfjs/core` Application | `register(ServiceProvider\|Function)` | `this` (fluent) | Register a service provider or callback |
| `boot()` | `@ecfjs/core` Application | `boot()` | `Promise<void>` | Boot all registered providers |
| `make()` | `@ecfjs/core` Container | `make(abstract, params?)` | `T` | Resolve a binding from the container |
| `singleton()` | `@ecfjs/core` Container | `singleton(abstract, factory)` | `this` (fluent) | Register a singleton binding |
| `bind()` | `@ecfjs/core` Container | `bind(abstract, factory)` | `this` (fluent) | Register a transient binding |

---

## Driver & Channel Methods

| Method | Package | Signature | Return Type | Description |
|---|---|---|---|---|
| `driver(name?)` | `@ecfjs/cache`, `@ecfjs/queue`, `@ecfjs/mail`, `@ecfjs/storage`, `@ecfjs/logging`, `@ecfjs/ai` | `driver(name?: string)` | `DriverInstance` | Resolve named driver; defaults to config default |
| `channel(name?)` | `@ecfjs/logging`, `@ecfjs/notifications`, `@ecfjs/broadcast` | `channel(name?: string)` | `ChannelInstance` | Resolve named notification/log/broadcast channel |
| `connection(name?)` | `@ecfjs/database` | `connection(name?: string)` | `Connection` | Resolve named database connection |

---

## Extension & Configuration Methods

| Method | Package | Signature | Return Type | Description |
|---|---|---|---|---|
| `extend()` | `@ecfjs/core` Facade, `@ecfjs/support` Macroable | `extend(name, callback)` | `void` | Add a runtime method to a class |
| `use()` | `@ecfjs/http` Application | `use(middleware)` | `this` (fluent) | Register global HTTP middleware |
| `macro()` | `@ecfjs/support` Macroable | `macro(name, callback)` | `void` | Alias for `extend()` on Macroable classes |

---

## Testing Fake Methods

| Method | Package | Signature | Return Type | Description |
|---|---|---|---|---|
| `fake()` | `@ecfjs/queue`, `@ecfjs/cache`, `@ecfjs/mail`, `@ecfjs/events`, `@ecfjs/ai`, `@ecfjs/storage` | `fake()` | `FakeInstance` | Replace real service with in-memory fake |
| `assertPushed()` | `@ecfjs/queue` | `assertPushed(JobClass, callback?)` | `void` | Assert a job was dispatched |
| `assertSent()` | `@ecfjs/mail` | `assertSent(MailableClass, callback?)` | `void` | Assert a mailable was sent |
| `assertDispatched()` | `@ecfjs/events` | `assertDispatched(event, callback?)` | `void` | Assert an event was dispatched |

---

## Model & Resource Methods

| Method | Package | Signature | Return Type | Description |
|---|---|---|---|---|
| `model(name)` | `@ecfjs/database` | `model(name: string)` | `ModelClass` | Resolve a registered model class |
| `factory(model)` | `@ecfjs/testing` | `factory(ModelClass)` | `ModelFactory` | Create a model factory for tests |

---

## Fluent API Conventions

### Return Types

| Pattern | Convention |
|---|---|
| Registration methods (`register`, `bind`, `singleton`, `use`) | Return `this` for method chaining |
| Resolution methods (`make`, `driver`, `channel`, `connection`) | Return resolved instance |
| Action methods (`boot`, `dispatch`, `send`) | Return `Promise<T>` for async, `T` for sync |
| Assertion methods (`assertPushed`, `assertSent`) | Return `void`; throw on failure |

### Argument Ordering

1. **Identifier first**: driver name, channel name, model name, binding key
2. **Payload second**: data object, factory callback, middleware function
3. **Options last**: optional configuration object

### Naming Rules

- Manager classes use `{Domain}Manager` (e.g., `CacheManager`, `QueueManager`)
- Facades use short names (e.g., `Cache`, `Queue`, `Auth`, `Log`)
- Service providers use `{Domain}ServiceProvider`
- Testing fakes use `{Domain}Fake` or return fake from `{Domain}.fake()`

---

## Conformance Verification

Each package MUST verify conformance via:

1. Public API exports in `src/index.d.ts` match this matrix
2. `ContractAssert` tests in `@ecfjs/testing` validate method signatures
3. Package README quick-start examples use conformant API patterns

---

## Non-Conformant Patterns (Forbidden)

```javascript
// ❌ Deep imports bypassing public API
import TrieNode from "@ecfjs/http/src/routing/TrieNode.js";

// ❌ Inconsistent return type (void instead of this)
app.register(provider); // must return app for chaining

// ❌ Driver resolution without config fallback
Cache.driver("nonexistent"); // must throw ConfigError, not silent fail
```
