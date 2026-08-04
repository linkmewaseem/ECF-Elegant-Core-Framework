# ECF — Package Catalog

This document provides the **root-level package catalog** with ownership, maturity status, and documentation completeness for every package in the ECF monorepo.

---

## Maturity Legend

| Stage | Label | Description |
|---|---|---|
| 1 | Plan | RFC and scope defined |
| 2 | Contract | Public API and interfaces specified |
| 3 | Implementation | Core features implemented |
| 4 | Tests | Unit and integration tests passing |
| 5 | Benchmarks | Performance SLAs verified |
| 6 | Freeze | Architecture frozen, exports locked |
| 7 | Stable | v1.0.0 production release |

---

## Core Subsystem

| Package | Owner | Stage | README | ARCHITECTURE | BENCHMARKS | Tests |
|---|---|---|---|---|---|---|
| `@ecf/core` | Core Team | 6 — Freeze | ✅ | ✅ | ✅ | ✅ |
| `@ecf/support` | Core Team | 6 — Freeze | ✅ | ✅ | — | ✅ |
| `@ecf/config` | Core Team | 5 — Benchmarks | ✅ | ✅ | — | ✅ |
| `@ecf/events` | Core Team | 5 — Benchmarks | ✅ | ✅ | — | ✅ |
| `@ecf/contracts` | Core Team | 6 — Freeze | ✅ | ✅ | — | ✅ |

---

## HTTP & Presentation

| Package | Owner | Stage | README | ARCHITECTURE | BENCHMARKS | Tests |
|---|---|---|---|---|---|---|
| `@ecf/http` | HTTP Team | 6 — Freeze | ✅ | ✅ | ✅ | ✅ |
| `@ecf/validation` | HTTP Team | 5 — Benchmarks | ✅ | ✅ | — | ✅ |
| `@ecf/view` | HTTP Team | 6 — Freeze | ✅ | ✅ | ✅ | ✅ |

---

## Data Layer

| Package | Owner | Stage | README | ARCHITECTURE | BENCHMARKS | Tests |
|---|---|---|---|---|---|---|
| `@ecf/database` | Data Team | 6 — Freeze | ✅ | ✅ | ✅ | ✅ |
| `@ecf/cache` | Data Team | 5 — Benchmarks | ✅ | ✅ | — | ✅ |
| `@ecf/search` | Data Team | 5 — Benchmarks | ✅ | ✅ | — | ✅ |

---

## Enterprise Services

| Package | Owner | Stage | README | ARCHITECTURE | BENCHMARKS | Tests |
|---|---|---|---|---|---|---|
| `@ecf/auth` | Security Team | 6 — Freeze | ✅ | ✅ | — | ✅ |
| `@ecf/queue` | Services Team | 6 — Freeze | ✅ | ✅ | — | ✅ |
| `@ecf/mail` | Services Team | 5 — Benchmarks | ✅ | ✅ | — | ✅ |
| `@ecf/storage` | Services Team | 5 — Benchmarks | ✅ | ✅ | — | ✅ |
| `@ecf/upload` | Services Team | 5 — Benchmarks | ✅ | ✅ | ✅ | ✅ |
| `@ecf/media` | Services Team | 5 — Benchmarks | ✅ | ✅ | — | ✅ |
| `@ecf/broadcast` | Services Team | 5 — Benchmarks | ✅ | ✅ | — | ✅ |
| `@ecf/notifications` | Services Team | 5 — Benchmarks | ✅ | ✅ | — | ✅ |
| `@ecf/scheduler` | Services Team | 4 — Tests | ✅ | ✅ | — | ✅ |
| `@ecf/logging` | Services Team | 5 — Benchmarks | ✅ | ✅ | — | ✅ |

---

## API Platform

| Package | Owner | Stage | README | ARCHITECTURE | BENCHMARKS | Tests |
|---|---|---|---|---|---|---|
| `@ecf/api` | API Team | 5 — Benchmarks | ✅ | ✅ | — | ✅ |
| `@ecf/ai` | AI Team | 4 — Tests | ✅ | ✅ | — | ✅ |

---

## Developer Tooling

| Package | Owner | Stage | README | ARCHITECTURE | BENCHMARKS | Tests |
|---|---|---|---|---|---|---|
| `@ecf/testing` | DevTools Team | 5 — Benchmarks | ✅ | ✅ | — | ✅ |
| `@ecf/devkit` | DevTools Team | 5 — Benchmarks | ✅ | ✅ | — | ✅ |
| `@ecf/devtools` | DevTools Team | 4 — Tests | ✅ | ✅ | — | ✅ |
| `@ecf/cli` | DevTools Team | 4 — Tests | ✅ | ✅ | — | ✅ |
| `@ecf/console` | DevTools Team | 4 — Tests | ✅ | ✅ | — | ✅ |
| `@ecf/observability` | DevTools Team | 4 — Tests | ✅ | ✅ | — | ✅ |
| `@ecf/skeleton` | DevTools Team | 4 — Tests | ✅ | ✅ | — | ✅ |

---

## Documentation Completeness Summary

| Metric | Count | Total | Coverage |
|---|---|---|---|
| README.md | 30 | 30 | 100% |
| ARCHITECTURE.md | 30 | 30 | 100% |
| BENCHMARKS.md | 4 | 30 | 13% |
| Security Review | 8 | 30 | 27% |

---

## Target for v1.0.0 Stable

- All Core and HTTP packages at Stage 7 (Stable)
- All Enterprise Services at Stage 6+ (Architecture Freeze)
- README and ARCHITECTURE at 100% (achieved)
- BENCHMARKS.md for all hot-path packages (core, http, database, view, queue, auth)
- Security review completed for auth, http, upload, notifications, ai
