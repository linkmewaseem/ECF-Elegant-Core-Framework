# ECF — Dependency Rules & Graph Boundaries

This document defines the strict **Dependency Rules & Graph Boundaries** for the ECF (Elegant Core Framework) monorepo. It establishes permitted dependency directions and explicitly forbids circular dependencies across all packages.

---

## 🚫 The Cardinal Rule of ECF Dependencies

> **No lower-level package may depend upon, import from, or require knowledge of any higher-level engine or consumer package — whether in production dependencies OR development test suites.**

---

## 🧭 Dependency Direction Matrix

### Permitted Import Directions (✅ Allowed)

```
HTTP          ➔  Core
HTTP          ➔  Validation
Database      ➔  Core
Database      ➔  Support
View          ➔  Core
View          ➔  HTTP
Extensions    ➔  Database
Extensions    ➔  Core
Skeleton      ➔  Core, Database, HTTP, View, Validation
CLI           ➔  Core, Database, HTTP, View, Skeleton
Console       ➔  Core, Support
DevTools      ➔  Core, HTTP, Database
Queue         ➔  Core, Database, Support
```

### Strictly Forbidden Directions (❌ Forbidden)

| Source Package | Forbidden Target Import | Architectural Reason |
|---|---|---|
| `@ecfjs/core` | `@ecfjs/http`, `@ecfjs/database`, `@ecfjs/view`, `@ecfjs/cli` | Core is the IoC foundation. Zero outer package knowledge. |
| `@ecfjs/support` | `@ecfjs/database`, `@ecfjs/http`, `@ecfjs/view` | Support contains pure utility primitives only. |
| `@ecfjs/database` | `@ecfjs/view`, `@ecfjs/cli`, `@ecfjs/skeleton` | Database engine must be usable in CLI, API, or worker apps without rendering. |
| `@ecfjs/view` | `@ecfjs/cli`, `@ecfjs/skeleton`, `@ecfjs/database` | View engine compiles templates independently of database ORM logic. |
| `@ecfjs/validation` | `@ecfjs/http`, `@ecfjs/view`, `@ecfjs/database` | Validation is a standalone rule engine. |
| Any Package | Monorepo Circular Import (A ➔ B ➔ A) | Causes module resolution deadlocks and breaks clean tree-shaking. |

---

## 🛠️ Automated CI Enforcement

To guarantee zero circular dependencies in ECF:
1. Every CI pipeline run executes:
   ```bash
   pnpm test
   ```
2. Any `[WARN] There are cyclic workspace dependencies` detected during pnpm resolution triggers an immediate build exit code failure (`exit 1`).
3. Package imports are validated via ESLint import boundaries and strict TypeScript module resolution.
