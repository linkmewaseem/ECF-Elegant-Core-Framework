# ECF — Package Compatibility Matrix

This document defines the official **Cross-Package Compatibility Matrix** for all packages within the ECF (Elegant Core Framework) ecosystem for the **v1.0 Release Candidate** series.

---

## 📊 Cross-Package Compatibility Grid

| Package Name | Compatible Core Version | Compatible Database | Compatible HTTP | Compatible View | Compatible Validation | Package Stability Status |
|---|---|---|---|---|---|---|
| **`@ecfjs/core`** | **1.x** | Optional | Optional | Optional | Optional | 🟢 Architecture Locked |
| **`@ecfjs/support`** | **1.x** | Optional | Optional | Optional | Optional | 🟢 Architecture Locked |
| **`@ecfjs/database`** | **1.x** | **1.x** | Optional | N/A | Optional | 🟢 Architecture Locked |
| **`@ecfjs/validation`** | **1.x** | Optional | Optional | Optional | **1.x** | 🟢 Architecture Locked |
| **`@ecfjs/http`** | **1.x** | Optional | **1.x** | Optional | **1.x** | 🟢 Architecture Locked |
| **`@ecfjs/view`** | **1.x** | N/A | **1.x** | **1.x** | Optional | 🟢 Architecture Locked |
| **`@ecfjs/extensions`** | **1.x** | **1.x** | Optional | N/A | Optional | 🟢 Architecture Locked |
| **`@ecfjs/skeleton`** | **1.x** | **1.x** | **1.x** | **1.x** | **1.x** | 🟢 Architecture Locked |
| **`@ecfjs/cli`** | **1.x** | **1.x** | **1.x** | **1.x** | **1.x** | 🟢 Architecture Locked |
| **`@ecfjs/console`** | **1.x** | Optional | Optional | N/A | Optional | 🟡 In Development (M13) |
| **`@ecfjs/devtools`** | **1.x** | **1.x** | **1.x** | **1.x** | Optional | 🟡 Planned (M14) |
| **`@ecfjs/queue`** | **1.x** | **1.x** | Optional | N/A | Optional | 🟡 Planned (M15) |

*Key:*
- `1.x`: Indicates explicit dependency on v1.x interface contract of the named package.
- `Optional`: Package can operate with or without the named package via IoC container resolution.
- `N/A`: Package has no direct operational interaction with the named package.

---

## ⚙️ Environment & Engine Requirements

All packages in the ECF ecosystem strictly enforce the following runtime standards:

```json
{
  "engines": {
    "node": ">=22"
  },
  "type": "module"
}
```

1. **Node.js Engine**: `>=22.0.0` (Enforces modern V8 optimizations, native `node:test`, and ESM features).
2. **Module Format**: ECMAScript Modules (`"type": "module"`). CommonJS (`require()`) is deprecated and unsupported.
3. **Workspace Standard**: Managed using `pnpm` workspaces (`pnpm-workspace.yaml`).

---

## 🔒 Upgradability & Compatibility Guarantees

1. **Minor Version Backwards Compatibility**: Any `1.x` release of a package will remain fully compatible with all other `1.x` packages in the ecosystem.
2. **Contract Interoperability**: Packages interact strictly through container service keys (e.g. `"http.router"`, `"db"`, `"view"`, `"validation"`), allowing individual package updates without breaking consumers.
