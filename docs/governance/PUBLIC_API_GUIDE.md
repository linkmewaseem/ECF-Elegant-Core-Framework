# ECF — Public API Surface & Encapsulation Guide

This document specifies the rules for defining, exposing, and encapsulating the **Public API Surface** of every ECF package while hiding internal compiler, runtime, and AST details.

---

## 🏛️ Public Surface Principles

In ECF, application developers and extension authors must only interact with **officially exported public symbols**. Internal subdirectories and private classes are encapsulated to guarantee long-term stability and eliminate unexpected breaking changes during upgrades.

---

## 📦 Package Entry-Point Standard (`package.json`)

Every package in the ECF ecosystem must specify explicit entry points via the `"exports"` property in `package.json`:

```json
{
  "name": "@ecf/http",
  "version": "1.0.0-rc.1",
  "type": "module",
  "main": "./src/index.js",
  "types": "./src/index.d.ts",
  "exports": {
    ".": {
      "types": "./src/index.d.ts",
      "default": "./src/index.js"
    }
  }
}
```

### 🚫 Forbidden Subpath Exports
Deep imports into package internals are strictly blocked by Node.js package resolution:
```javascript
// ❌ FORBIDDEN & BLOCKED by package.json exports:
import TrieNode from "@ecf/http/src/internal/TrieNode.js";
import ASTCompiler from "@ecf/view/src/compiler/ASTCompiler.js";

// ✅ RECOMMENDED & SUPPORTED:
import { Router, Request, Response } from "@ecf/http";
import { ViewEngine } from "@ecf/view";
```

---

## 📁 Internal Namespace Conventions

Directory structures within package `src/` follow these strict naming rules:

| Directory Path | Intended Purpose | Exposed to Public API? |
|---|---|---|
| `src/index.js` | Primary public export barrel file. | 🟢 **Public API** |
| `src/contracts/` | Abstract classes, interfaces, and base error definitions. | 🟢 **Public API** |
| `src/internal/` | Private helper logic, trie nodes, cache buffers, internal state wrappers. | 🔴 **Internal Only (Encapsulated)** |
| `src/compiler/` | AST lexers, tokenizers, expression parsers, and node visitors. | 🔴 **Internal Only (Encapsulated)** |
| `src/runtime/` | Execution context state, stack frames, and evaluation loops. | 🔴 **Internal Only (Encapsulated)** |

---

## 🛡️ Deprecation & Public API Changes

1. **Method Signature Guarantee**: Public methods will not remove or alter required parameter positions within a major release (e.g. `v1.x`).
2. **Deprecation Warnings**: If a public API is slated for removal in a future major version, it must issue a runtime warning (`logger.warning("...")`) for at least one minor release cycle before removal.
