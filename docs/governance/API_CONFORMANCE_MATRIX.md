# ECF — API Conformance Matrix

This document defines the **fluent API conventions** that all ECF packages must follow for methods like `use()`, `fake()`, `extend()`, `driver()`, `channel()`, `model()`, `make()`, `register()`, and `boot()`.

---

## Core Lifecycle Methods

| Method | Package | Signature | Return Type | Description |
|---|---|---|---|---|
| `register()` | `@ecf/core` Application | `register(ServiceProvider\|Function)` | `this` (fluent) | Register a service provider or callback |
| `boot()` | `@ecf/core` Application | `boot()` | `Promise<void>` | Boot all registered providers |
| `make()` | `@ecf/core` Container | `make(abstract, params?)` | `T` | Resolve a binding from the container |
| `singleton()` | `@ecf/core` Container | `singleton(abstract, factory)` | `this` (fluent) | Register a singleton binding |
| `bind()` | `@ecf/core` Container | `bind(abstract, factory)` | `this` (fluent) | Register a transient binding |

---

## Driver & Channel Methods

| Method | Package | Signature | Return Type | Description |
|---|---|---|---|---|
| `driver(name?)` | `@ecf/cache`, `@ecf/queue`, `@ecf/mail`, `@ecf/storage`, `@ecf/logging`, `@ecf/ai` | `driver(name?: string)` | `DriverInstance` | Resolve named driver; defaults to config default |
| `channel(name?)` | `@ecf/logging`, `@ecf/notifications`, `@ecf/broadcast` | `channel(name?: string)` | `ChannelInstance` | Resolve named notification/log/broadcast channel |
| `connection(name?)` | `@ecf/database` | `connection(name?: string)` | `Connection` | Resolve named database connection |

---

## Extension & Configuration Methods

| Method | Package | Signature | Return Type | Description |
|---|---|---|---|---|
| `extend()` | `@ecf/core` Facade, `@ecf/support` Macroable | `extend(name, callback)` | `void` | Add a runtime method to a class |
| `use()` | `@ecf/http` Application | `use(middleware)` | `this` (fluent) | Register global HTTP middleware |
| `macro()` | `@ecf/support` Macroable | `macro(name, callback)` | `void` | Alias for `extend()` on Macroable classes |

---

## Testing Fake Methods

| Method | Package | Signature | Return Type | Description |
|---|---|---|---|---|
| `fake()` | `@ecf/queue`, `@ecf/cache`, `@ecf/mail`, `@ecf/events`, `@ecf/ai`, `@ecf/storage` | `fake()` | `FakeInstance` | Replace real service with in-memory fake |
| `assertPushed()` | `@ecf/queue` | `assertPushed(JobClass, callback?)` | `void` | Assert a job was dispatched |
| `assertSent()` | `@ecf/mail` | `assertSent(MailableClass, callback?)` | `void` | Assert a mailable was sent |
| `assertDispatched()` | `@ecf/events` | `assertDispatched(event, callback?)` | `void` | Assert an event was dispatched |

---

## Model & Resource Methods

| Method | Package | Signature | Return Type | Description |
|---|---|---|---|---|
| `model(name)` | `@ecf/database` | `model(name: string)` | `ModelClass` | Resolve a registered model class |
| `factory(model)` | `@ecf/testing` | `factory(ModelClass)` | `ModelFactory` | Create a model factory for tests |

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
2. `ContractAssert` tests in `@ecf/testing` validate method signatures
3. Package README quick-start examples use conformant API patterns

---

## Non-Conformant Patterns (Forbidden)

```javascript
// ❌ Deep imports bypassing public API
import TrieNode from "@ecf/http/src/routing/TrieNode.js";

// ❌ Inconsistent return type (void instead of this)
app.register(provider); // must return app for chaining

// ❌ Driver resolution without config fallback
Cache.driver("nonexistent"); // must throw ConfigError, not silent fail
```
