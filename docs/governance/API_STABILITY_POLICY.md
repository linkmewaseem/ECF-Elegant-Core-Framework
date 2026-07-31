# ECF — API Stability & Versioning Policy

This document defines the **Semantic Versioning Policy (SemVer)**, stability classifications, and breaking change rules enforced across all packages in the ECF (Elegant Core Framework) ecosystem.

---

## 🏷️ Stability Classifications

Every module, class, and function in ECF falls into one of three stability tiers:

### 1. 🟢 Stable Public API (`Stable`)
- **Scope**: All symbols exported from a package's primary entry point (`src/index.js`).
- **Guarantee**: Guaranteed backward compatible across all `1.x` minor and patch releases. No breaking signature changes will occur without a major version bump (`2.0.0`).

### 2. 🔴 Internal Private API (`Internal`)
- **Scope**: Code located inside `src/internal/`, `src/compiler/`, or `src/runtime/`.
- **Guarantee**: No backward compatibility guarantee. Internal classes may be refactored, renamed, or removed between minor releases without warning. External apps must NOT import directly from internal directories.

### 3. 🟡 Experimental API (`Experimental`)
- **Scope**: Features explicitly marked with `@experimental` JSDoc annotations or preview flags.
- **Guarantee**: Subject to iterative design changes based on community feedback. May change prior to final stabilization.

---

## 🔢 Semantic Versioning Rules (`MAJOR.MINOR.PATCH`)

- **`MAJOR`**: Incremented when backwards-incompatible breaking changes are introduced to the **Stable Public API**.
- **`MINOR`**: Incremented when new backward-compatible features, providers, or drivers are added to the ecosystem.
- **`PATCH`**: Incremented for backward-compatible bug fixes, security patches, and performance optimizations.

---

## ⚠️ Deprecation & Sunset Lifecycle

Before any stable public API can be removed in a future `MAJOR` release:
1. It must be marked as `@deprecated` in JSDoc and documented in release notes.
2. It must remain functional for at least **one full MINOR release cycle** while emitting a non-blocking logger warning when invoked.
3. Alternative migration APIs must be provided in the deprecation message.
