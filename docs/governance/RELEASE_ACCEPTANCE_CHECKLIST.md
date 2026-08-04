# ECF — Release Acceptance Checklist

This document defines the **200-point release acceptance checklist** that must pass before any ECF package or ecosystem release is promoted to stable (v1.0.0).

---

## Scoring Overview

| Category | Points | Pass Threshold |
|---|---|---|
| Documentation | 30 | ≥ 24 |
| Architecture & API | 30 | ≥ 24 |
| Testing | 40 | ≥ 32 |
| Security | 30 | ≥ 24 |
| Performance | 30 | ≥ 24 |
| CI/CD & Release | 20 | ≥ 16 |
| Production Readiness | 20 | ≥ 16 |
| **Total** | **200** | **≥ 160** |

---

## 1. Documentation (30 points)

| # | Criterion | Points | Status |
|---|---|---|---|
| 1.1 | Package `README.md` exists with features and quick start | 5 | ☐ |
| 1.2 | Package `ARCHITECTURE.md` exists with components and dependency rules | 5 | ☐ |
| 1.3 | Public API documented in `src/index.d.ts` | 5 | ☐ |
| 1.4 | Root docs portal links to package chapter | 3 | ☐ |
| 1.5 | Production examples or tutorials exist | 5 | ☐ |
| 1.6 | CHANGELOG entry for release version | 4 | ☐ |
| 1.7 | Breaking changes documented with migration guide | 3 | ☐ |

---

## 2. Architecture & API (30 points)

| # | Criterion | Points | Status |
|---|---|---|---|
| 2.1 | Package follows standard directory structure (`src/contracts/`, `src/index.js`) | 5 | ☐ |
| 2.2 | `package.json` exports locked to public entry point only | 5 | ☐ |
| 2.3 | Zero cyclic dependencies verified | 5 | ☐ |
| 2.4 | Dependency rules from `DEPENDENCY_RULES.md` satisfied | 5 | ☐ |
| 2.5 | Public API conforms to `API_CONFORMANCE_MATRIX.md` | 5 | ☐ |
| 2.6 | Architecture freeze document published (Stage 6+) | 5 | ☐ |

---

## 3. Testing (40 points)

| # | Criterion | Points | Status |
|---|---|---|---|
| 3.1 | Unit tests exist with 100% pass rate | 10 | ☐ |
| 3.2 | Integration tests for cross-package pairs (see `CROSS_PACKAGE_TEST_MATRIX.md`) | 10 | ☐ |
| 3.3 | Error propagation and boundary tests exist | 5 | ☐ |
| 3.4 | Testing fake available (`fake()`, `assertPushed()`, etc.) where applicable | 5 | ☐ |
| 3.5 | Zero flaky or skipped tests | 5 | ☐ |
| 3.6 | Test matrix entry in `CROSS_PACKAGE_TEST_MATRIX.md` updated | 5 | ☐ |

---

## 4. Security (30 points)

| # | Criterion | Points | Status |
|---|---|---|---|
| 4.1 | Security review checklist completed (see `SECURITY_REVIEW_CHECKLIST.md`) | 10 | ☐ |
| 4.2 | Input validation on all public entry points | 5 | ☐ |
| 4.3 | No secrets or credentials in source or tests | 5 | ☐ |
| 4.4 | Adversarial/security tests exist for auth, upload, and webhook packages | 5 | ☐ |
| 4.5 | Rate limiting on sensitive endpoints where applicable | 5 | ☐ |

---

## 5. Performance (30 points)

| # | Criterion | Points | Status |
|---|---|---|---|
| 5.1 | `BENCHMARKS.md` exists with SLA table | 5 | ☐ |
| 5.2 | Benchmarks pass with no regression > 5% | 10 | ☐ |
| 5.3 | Hot-path operations meet `PERFORMANCE_CONTRACT.md` SLAs | 10 | ☐ |
| 5.4 | Memory allocation profiled for long-running services | 5 | ☐ |

---

## 6. CI/CD & Release (20 points)

| # | Criterion | Points | Status |
|---|---|---|---|
| 6.1 | `pnpm lint` passes with zero errors | 3 | ☐ |
| 6.2 | `pnpm typecheck` passes with zero errors | 3 | ☐ |
| 6.3 | `pnpm test` passes across all workspace packages | 5 | ☐ |
| 6.4 | `pnpm bench` passes with no SLA regression | 4 | ☐ |
| 6.5 | npm publish dry-run succeeds | 3 | ☐ |
| 6.6 | Git tag and GitHub release created | 2 | ☐ |

---

## 7. Production Readiness (20 points)

| # | Criterion | Points | Status |
|---|---|---|---|
| 7.1 | Package maturity stage ≥ 6 (Architecture Freeze) per `PACKAGE_LIFECYCLE.md` | 5 | ☐ |
| 7.2 | SemVer version correctly reflects maturity (no `-alpha` for stable) | 3 | ☐ |
| 7.3 | npm registry metadata complete (description, keywords, repository) | 3 | ☐ |
| 7.4 | Graceful shutdown handlers for long-running processes | 3 | ☐ |
| 7.5 | Health check endpoint or status command available | 3 | ☐ |
| 7.6 | Package catalog entry updated in `PACKAGE_CATALOG.md` | 3 | ☐ |

---

## Release Sign-Off

| Role | Name | Date | Signature |
|---|---|---|---|
| Package Owner | | | |
| Security Reviewer | | | |
| Release Manager | | | |

**Minimum score to release: 160/200**
