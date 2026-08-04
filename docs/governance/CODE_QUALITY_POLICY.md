# ECF — Code Quality Policy

This document defines the **shared lint, typecheck, and quality gate policy** across the ECF monorepo.

---

## Quality Gates

| Gate | Command | Pass Criteria |
|---|---|---|
| Lint | `pnpm lint` | Zero errors and warnings |
| Type Check | `pnpm typecheck` | `tsc --noEmit` exits with 0 errors |
| Unit Tests | `pnpm test` | 100% pass rate, zero skipped |
| Benchmarks | `pnpm bench` | No regression > 5% from baseline |
| Architecture | `pnpm arch-check` | Zero cyclic dependencies |

---

## Package-Level Quality Checklist

Each package owner MUST verify before release:

| # | Criterion | Status |
|---|---|---|
| Q1 | All public exports documented in `src/index.d.ts` | ☐ |
| Q2 | JSDoc on all public class methods | ☐ |
| Q3 | No dead code or unused exports in `src/index.js` | ☐ |
| Q4 | Error classes extend appropriate base (`ECFError`, package error) | ☐ |
| Q5 | Internal modules in `src/internal/` not exported | ☐ |
| Q6 | Consistent ESM import style (`.js` extensions) | ☐ |
| Q7 | No `console.log` in production code paths | ☐ |
| Q8 | Test files mirror source structure in `tests/` | ☐ |

---

## Type Coverage Expectations

| Package Tier | Type Coverage Target |
|---|---|
| Core (Stage 6+) | 100% public API in `index.d.ts` |
| Enterprise Services (Stage 5+) | 100% public API in `index.d.ts` |
| Tooling (Stage 4+) | 80% public API in `index.d.ts` |

---

## Dead Code Reduction

- Run export analysis before each release to identify unused public exports.
- Remove deprecated methods only in major version bumps per `API_STABILITY_POLICY.md`.
- Internal helpers MUST live in `src/internal/` and MUST NOT appear in `index.js`.

---

## Enforcement

Quality gates are enforced via CI pipeline stages defined in `CI_RELEASE_PIPELINE.md`. Packages failing any gate block release promotion.
