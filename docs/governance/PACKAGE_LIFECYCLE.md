# ECF — Package Maturity & Development Lifecycle

This document defines the official **7-Stage Package Maturity Lifecycle** required for every package in the ECF (Elegant Core Framework) ecosystem before it can be designated as **Stable (v1.0)**.

---

## 🔄 The 7-Stage Package Lifecycle

```
┌───────────┐    ┌───────────┐    ┌────────────────┐    ┌───────────┐
│ 1. Plan   ├─►  │2.Contract ├─►  │3.Implementation├─►  │ 4. Tests  │
└───────────┘    └───────────┘    └────────────────┘    └─────┬─────┘
                                                              │
┌───────────┐    ┌───────────┐    ┌────────────────┐          │
│7. Maint.  │◄───┤ 6. Stable │◄───┤  5. Freeze     │◄─────────┘
└───────────┘    └───────────┘    └────────────────┘
```

---

## 📑 Stage Breakdown & Criteria

### Stage 1: Planning & RFC
- **Objective**: Define problem domain, user requirements, dependencies, and architecture goals.
- **Criteria**: Complete RFC document outlining scope, component roles, and target performance goals.

### Stage 2: Public API & Contract Specification
- **Objective**: Design public interfaces, error hierarchies, method signatures, and extension hooks BEFORE writing implementation logic.
- **Criteria**: Interfaces and abstract contract classes specified in `src/contracts/` or `src/index.d.ts`.

### Stage 3: Implementation & Decoupled Execution
- **Objective**: Implement package features ensuring strict adherence to layer boundaries.
- **Criteria**: Zero tight coupling to concrete external implementations outside defined dependencies.

### Stage 4: Comprehensive Test Suite & Zero Flakiness
- **Objective**: Write unit tests, boundary tests, error propagation tests, and integration tests using `node:test`.
- **Criteria**: 100% test pass rate with zero skipped or flaky tests across node test runners.

### Stage 5: Benchmarks & SLA Verification
- **Objective**: Run performance benchmark suites to measure throughput, compilation speed, memory allocation, and hydration rates.
- **Criteria**: Package meets or exceeds the SLAs specified in `PERFORMANCE_CONTRACT.md`.

### Stage 6: Architecture Freeze & Version Lock
- **Objective**: Lock public API surface, freeze method signatures, hide internal modules, and issue an official Architecture Freeze document.
- **Criteria**: `ARCHITECTURE_FREEZE_v1.0.md` published and package `exports` locked.

### Stage 7: Stable (v1.0.0) & Production Maintenance
- **Objective**: Publish package under SemVer 1.0.0 for enterprise production usage.
- **Criteria**: LTS maintenance policy active; strict backward-compatibility rules enforced.

---

## 🏆 Current Status of ECF Packages

| Package Name | Current Stage | Target Release |
|---|---|---|
| `@ecfjs/core` | **Stage 6: Architecture Freeze** | v1.0.0 |
| `@ecfjs/support` | **Stage 6: Architecture Freeze** | v1.0.0 |
| `@ecfjs/database` | **Stage 6: Architecture Freeze** | v1.0.0 |
| `@ecfjs/http` | **Stage 6: Architecture Freeze** | v1.0.0 |
| `@ecfjs/view` | **Stage 6: Architecture Freeze** | v1.0.0 |
| `@ecfjs/validation` | **Stage 6: Architecture Freeze** | v1.0.0 |
| `@ecfjs/extensions` | **Stage 6: Architecture Freeze** | v1.0.0 |
| `@ecfjs/skeleton` | **Stage 6: Architecture Freeze** | v1.0.0 |
| `@ecfjs/cli` | **Stage 6: Architecture Freeze** | v1.0.0 |
| `@ecfjs/console` | **Stage 1: Planning (Milestone 13)** | v1.0.0 |
| `@ecfjs/devtools` | **Stage 1: Planning (Milestone 14)** | v1.0.0 |
| `@ecfjs/queue` | **Stage 1: Planning (Milestone 15)** | v1.0.0 |
