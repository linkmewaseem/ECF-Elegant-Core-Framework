# ECF — CI/CD & Release Pipeline Specification

This document outlines the **Automated Quality Gate Flow** for publishing releases in the ECF (Elegant Core Framework) monorepo.

---

## 🚀 The Release Pipeline Workflow

```
┌──────────┐    ┌─────────────┐    ┌────────────┐    ┌────────────────────┐
│ 1. Lint  ├─►  │2. Type Check├─►  │3. Unit Test├─►  │4.Integration Matrix│
└──────────┘    └─────────────┘    └────────────┘    └─────────┬──────────┘
                                                               │
┌──────────┐    ┌─────────────┐    ┌────────────┐              │
│7. Publish│◄───┤6. Arch Check│◄───┤5. Benchmark│◄─────────────┘
└──────────┘    └─────────────┘    └────────────┘
```

---

## 🛡️ Pipeline Stages & Quality Gates

### Stage 1: Code Linting & Formatting (`pnpm lint`)
- **Action**: Validates code style, indentations, and import standards across all workspace packages.
- **Pass Criteria**: Zero lint errors or warnings.

### Stage 2: TypeScript & Type Verification (`pnpm typecheck`)
- **Action**: Verifies type definitions in `src/index.d.ts` and JSDoc annotations across all ESM source files.
- **Pass Criteria**: `tsc --noEmit` exits with 0 errors.

### Stage 3: Monorepo Unit Test Execution (`pnpm test`)
- **Action**: Runs all unit tests across all 10 monorepo packages using Node's native test runner (`node --test`).
- **Pass Criteria**: 100% test pass rate with 0 failed suites.

### Stage 4: Cross-Package Integration Matrix Test
- **Action**: Executes integration tests pairing package combinations (`Core + HTTP`, `HTTP + View`, `Database + HTTP`, `Skeleton + CLI`).
- **Pass Criteria**: All integration workflows complete successfully.

### Stage 5: SLA & Performance Benchmarks (`pnpm bench`)
- **Action**: Runs benchmark test suites to verify performance against `PERFORMANCE_CONTRACT.md`.
- **Pass Criteria**: No performance regression > 5%.

### Stage 6: Architecture & Cyclic Dependency Check
- **Action**: Runs `pnpm` workspace audit to verify zero circular dependencies and public API export integrity.
- **Pass Criteria**: Zero circular dependency warnings.

### Stage 7: Automated Package Publication (`pnpm publish`)
- **Action**: Tags GitHub release and publishes updated package versions to npm registry under `@ecfjs/*` namespace.
