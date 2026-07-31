# ADR-004: Strict Package Boundaries & Public API Surface Encapsulation

## Status
**Accepted** (Implemented in Governance v1.0)

## Context
Frameworks like Laravel often suffer from developers importing private or internal classes directly, leading to breaking changes when internal code is refactored. We needed strict encapsulation boundaries across all ECF monorepo packages.

## Decision
1. Expose public symbols strictly via package `exports` in `package.json` pointing to `src/index.js`.
2. Encapsulate internal implementations under `src/internal/`, `src/compiler/`, and `src/runtime/`, blocking deep imports.
3. Enforce strict directional import rules (Lower layers NEVER import from higher layers).
4. Run automated pnpm workspace checks to fail builds on cyclic dependencies.

## Consequences

### Positive
- Prevents breaking changes for application developers during framework minor upgrades.
- Internal refactoring can occur safely without violating public contracts.
- Guarantees clean tree-shaking and zero circular dependency warnings.

### Negative
- Extension developers must rely strictly on published extension points and contract interfaces.
