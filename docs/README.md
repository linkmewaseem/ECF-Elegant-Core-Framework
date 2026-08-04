# ECF — Enterprise Core Framework Documentation Portal

Welcome to the official documentation portal for **ECF (Enterprise Core Framework)** — the 10/10 production-grade JavaScript/Node.js enterprise ecosystem.

---

## 📚 Documentation Chapters

1. [Core Subsystem (`@ecf/core`, `@ecf/support`, `@ecf/config`, `@ecf/events`, `@ecf/contracts`)](file:///f:/ecf/docs/core.md)
2. [HTTP Subsystem (`@ecf/http`, `@ecf/validation`, `@ecf/view`)](file:///f:/ecf/docs/http.md)
3. [Database Subsystem (`@ecf/database`)](file:///f:/ecf/docs/database.md)
4. [Enterprise Services (`@ecf/auth`, `@ecf/queue`, `@ecf/cache`, `@ecf/mail`, `@ecf/storage`, `@ecf/media`, `@ecf/broadcast`, `@ecf/notifications`, `@ecf/scheduler`)](file:///f:/ecf/docs/services.md)
5. [API Platform (`@ecf/api`, `@ecf/search`)](file:///f:/ecf/docs/api-platform.md)
6. [DevTools & Observability (`@ecf/devtools`, `@ecf/observability`)](file:///f:/ecf/docs/devtools.md)
7. [Enterprise Testing Platform (`@ecf/testing`)](file:///f:/ecf/docs/testing.md)
8. [Enterprise Logging & Channels (`@ecf/logging`)](file:///f:/ecf/docs/logging.md)
9. [Enterprise DevKit (`@ecf/devkit`)](file:///f:/ecf/docs/devkit.md)
10. [Enterprise AI Engine (`@ecf/ai`)](file:///f:/ecf/docs/ai.md)

---

## 🛡️ Governance & Release

| Document | Purpose |
| :--- | :--- |
| [Package Catalog & Maturity Status](governance/PACKAGE_CATALOG.md) | Ownership, maturity stage, and documentation completeness |
| [Release Acceptance Checklist](governance/RELEASE_ACCEPTANCE_CHECKLIST.md) | 200-point release gate before v1.0.0 |
| [Security Review Checklist](governance/SECURITY_REVIEW_CHECKLIST.md) | Per-package security controls |
| [API Conformance Matrix](governance/API_CONFORMANCE_MATRIX.md) | Fluent API conventions across packages |
| [Cross-Package Test Matrix](governance/CROSS_PACKAGE_TEST_MATRIX.md) | Integration test combinations |
| [Performance Contract](governance/PERFORMANCE_CONTRACT.md) | SLA baselines per package |
| [Package Lifecycle](governance/PACKAGE_LIFECYCLE.md) | 7-stage maturity model |
| [Dependency Rules](governance/DEPENDENCY_RULES.md) | Inter-package dependency boundaries |
| [Code Quality Policy](governance/CODE_QUALITY_POLICY.md) | Lint, typecheck, and quality gates |
| [CI Release Pipeline](governance/CI_RELEASE_PIPELINE.md) | Automated quality gate flow |

---

## 📦 Package Ecosystem Matrix

| Subsystem | Package | Standard / Reference |
| :--- | :--- | :--- |
| **Core** | `@ecf/core` | IoC Container & Service Providers |
| **Support** | `@ecf/support` | Collections & Utilities |
| **Config** | `@ecf/config` | Hierarchical Dot-Notation Config |
| **Events** | `@ecf/events` | Priority Lifecycle Event Bus |
| **Database** | `@ecf/database` | ORM, Schema & Migrations |
| **HTTP** | `@ecf/http` | Express / Fastify / PSR-7 Router |
| **Auth** | `@ecf/auth` | Guards, JWT, Session & Gates |
| **Queue** | `@ecf/queue` | Delayed Jobs & Rate-Limited Workers |
| **Logging** | `@ecf/logging` | Multi-Channel Monolog / Pino |
| **Testing** | `@ecf/testing` | DI Test Runner & Sandbox |
| **DevKit** | `@ecf/devkit` | Generators & AST Scaffolder |
| **AI Engine** | `@ecf/ai` | Multi-Provider LLM & Vector RAG |

---

## 📄 License

MIT Licensed. Copyright © 2026 ECF Team.
