# Extension Platform Architecture Freeze Declaration v1.0

This document serves as the official **Extension Platform Architecture Freeze Declaration v1.0** for the ECF (Enterprise Core Framework) plugin and extension subsystem (`packages/database/src/orm/extensions/`).

All extension specifications, API contracts, capability schemas, lifecycle stages, sandboxing rules, and fault-tolerance recovery contracts locked below are permanent.

---

## 🏛️ Locked Specifications & Component Contracts

### 1. Extension Directory Layout (`packages/database/src/orm/extensions/`)
- `Plugin.js`: Base Plugin Contract & Default Methods.
- `PluginContext.js`: Immutable, Sandboxed Plugin Context API.
- `PluginStorage.js`: Isolated Key-Value Private Storage per Extension.
- `PluginManager.js`: Central Coordination Hub.
- `PluginRegistry.js`: Per-Model Extension State, Feature Toggles & Health.
- `PluginResolver.js`: Topological Dependency & Semantic Capability Matcher.
- `CapabilityRegistry.js`: Semantic Capability Matcher & Injection Engine (`requires` / `provides` / `use`).
- `HookDispatcher.js`: Priority Group (`EARLY`, `NORMAL`, `LATE`) Hook Executor & Telemetry Tracker.
- `MetricsCollector.js`: Extension Execution, Duration & Error Metrics Tracker.
- `DependencyGraph.js`: Topological Sort Caching Engine.
- `PluginManifest.js`: Config & `plugin.json` Manifest Parser.
- `PluginException.js`: Extension Subsystem Exceptions.
- `PluginTypes.js`: Extension Category Enum.

---

### 2. Plugin Manifest Standard (`PluginManifest`)
Every extension defines a manifest containing:
```javascript
{
    id: Symbol("ecf:cache"),     // Unique internal Symbol identifier
    name: "@ecf/plugin-cache",  // Namespaced human-readable identifier
    version: "1.0.0",            // Extension SemVer
    apiVersion: "1",             // Supported ECF Plugin API version
    framework: "^1.0.0",         // Compatible ECF Framework version range
    type: "orm",                 // Extension Category (ORM, Cache, Security, Event, etc.)
    priorityGroup: "NORMAL",     // Priority Group: EARLY, NORMAL, LATE
    priority: 10,                // Numeric priority inside group (lower runs earlier)
    author: "",
    license: "MIT",
    homepage: "",
    repository: "",
    description: "",
    keywords: [],
    requires: {                  // Required capability dependencies
        cache: ">=1.0.0"
    },
    provides: {                  // Capability version & contract definitions
        cache: {
            version: "1.0.0",
            contract: null,       // Optional Interface/Contract validation
            methods: ["remember", "forget", "flush"]
        }
    }
}
```

---

### 3. Immutable Sandboxed `PluginContext` & Storage (`context.storage`)
Extensions NEVER access private fields or un-encapsulated internal state. All interactions take place through an immutable, read-only `PluginContext` proxy:
```javascript
context.model       // Model class or instance (read-only)
context.query       // QueryBuilder instance for the model
context.events      // ModelEventBus instance
context.container   // Application Service Container
context.config      // Config Manager
context.logger      // Logger instance
context.metrics     // MetricsCollector instance for this extension
context.storage     // Isolated private key-value storage (PluginStorage)
context.options     // User-provided extension configuration options
context.plugins     // Map of sibling active extensions on the model
context.capabilities// Capability Registry accessor
context.use(cap)    // Capability Dependency Injection helper (e.g. context.use("cache"))
```

---

### 4. 4-Stage Extension Lifecycle & Pre-Boot Validation
Boot validation order:
`Manifest Check` ➔ `Framework Version Match` ➔ `Dependencies Check` ➔ `Capabilities Match` ➔ `Stage Execution`.

Lifecycle stages:
1. `register(context)`: Registers container singletons (`context.container.singleton(...)`) and bindings.
2. `boot(context)`: Attaches model scopes, event listeners, and query extensions.
3. `ready(context)`: Invoked once all dependent extensions are booted.
4. `shutdown(context)`: Cleans up listeners and resources on uninstallation or reload.

Supports dynamic hot-reloading: `reload(context)` ➔ `shutdown(context)` ➔ `boot(context)` ➔ `ready(context)`.

---

### 5. Fault-Tolerant Plugin Recovery
If an extension encounters an unhandled exception during `boot()` or `ready()`:
1. Extension is automatically disabled (`enablePlugin(name, false)`).
2. Registered hooks for that extension are safely rolled back.
3. Extension is marked `unhealthy` with the error message in health state.
4. Framework continues execution without crashing the main application process.

---

### 6. Capability Dependency Injection (`context.use(capability)`)
- Extensions request capabilities via `context.use("cache")` or `context.capabilities.cache`.
- `CapabilityRegistry` resolves and injects the matching capability provider regardless of underlying implementation (Redis, File, Memory).

---

### 7. Hook Priority Groups & Telemetry Metadata
- Execution is grouped into 3 Priority Groups:
  1. `EARLY` (System & Security extensions)
  2. `NORMAL` (Standard extensions)
  3. `LATE` (Audit, Logging & Metrics extensions)
- `HookDispatcher` logs execution metadata per hook: `{ plugin, hook, durationMs, status, timestamp }`.

---

### 8. Feature Discovery & Inspection API
Models expose complete introspection:
- `Model.plugins()`: List of installed extension manifests and statuses.
- `Model.capabilities()`: Map of registered capabilities and providers.
- `Model.pluginDoctor()`: Diagnostic health report across all installed extensions.
- `Model.pluginMetrics(name)`: Call counts, durations, and error rates.
- `Model.extensionGraph()`: Dependency graph representation.

---

## 🔒 Guarantee of Backward Compatibility

Starting from v1.0:
1. Extension Platform v2 specifications are permanently locked.
2. All framework features (SoftDeletes, UUID, MultiTenant, Caching, Audit, etc.) operate as sandboxed extensions under this contract.
