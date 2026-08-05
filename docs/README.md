# ECF — Enterprise Core Framework Documentation Portal

Welcome to the official documentation portal for **ECF (Enterprise Core Framework)** — the 10/10 production-grade JavaScript/Node.js enterprise ecosystem.

---

## 📚 Documentation Chapters

1. [Core Subsystem (`@ecfjs/core`, `@ecfjs/support`, `@ecfjs/config`, `@ecfjs/events`, `@ecfjs/contracts`)](file:///f:/ecf/docs/core.md)
2. [HTTP Subsystem (`@ecfjs/http`, `@ecfjs/validation`, `@ecfjs/view`)](file:///f:/ecf/docs/http.md)
3. [Database Subsystem (`@ecfjs/database`)](file:///f:/ecf/docs/database.md)
4. [Enterprise Services (`@ecfjs/auth`, `@ecfjs/queue`, `@ecfjs/cache`, `@ecfjs/mail`, `@ecfjs/storage`, `@ecfjs/media`, `@ecfjs/broadcast`, `@ecfjs/notifications`, `@ecfjs/scheduler`)](file:///f:/ecf/docs/services.md)
5. [API Platform (`@ecfjs/api`, `@ecfjs/search`)](file:///f:/ecf/docs/api-platform.md)
6. [DevTools & Observability (`@ecfjs/devtools`, `@ecfjs/observability`)](file:///f:/ecf/docs/devtools.md)
7. [Enterprise Testing Platform (`@ecfjs/testing`)](file:///f:/ecf/docs/testing.md)
8. [Enterprise Logging & Channels (`@ecfjs/logging`)](file:///f:/ecf/docs/logging.md)
9. [Enterprise DevKit (`@ecfjs/devkit`)](file:///f:/ecf/docs/devkit.md)
10. [Enterprise AI Engine (`@ecfjs/ai`)](file:///f:/ecf/docs/ai.md)

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
| **Core** | `@ecfjs/core` | IoC Container & Service Providers |
| **Support** | `@ecfjs/support` | Collections & Utilities |
| **Config** | `@ecfjs/config` | Hierarchical Dot-Notation Config |
| **Events** | `@ecfjs/events` | Priority Lifecycle Event Bus |
| **Database** | `@ecfjs/database` | ORM, Schema & Migrations |
| **HTTP** | `@ecfjs/http` | Express / Fastify / PSR-7 Router |
| **Auth** | `@ecfjs/auth` | Guards, JWT, Session & Gates |
| **Queue** | `@ecfjs/queue` | Delayed Jobs & Rate-Limited Workers |
| **Logging** | `@ecfjs/logging` | Multi-Channel Monolog / Pino |
| **Testing** | `@ecfjs/testing` | DI Test Runner & Sandbox |
| **DevKit** | `@ecfjs/devkit` | Generators & AST Scaffolder |
| **AI Engine** | `@ecfjs/ai` | Multi-Provider LLM & Vector RAG |

---

## 📄 License

MIT Licensed. Copyright © 2026 ECF Team.
