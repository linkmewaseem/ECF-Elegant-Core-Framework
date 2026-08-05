# ECF Documentation

This directory contains framework, architecture, release, and contributor documentation for ECF (Elegant Core Framework).

## Start Here

- [Project structure](PROJECT_STRUCTURE.md) — monorepo layout, package boundaries, and where to begin.
- [Publishing guide](PUBLISHING.md) — prerequisites and a safe npm release process.
- [Release readiness](RELEASE_READINESS.md) — evidence-based publication assessment as of 2026-08-05.
- [Package catalog](governance/PACKAGE_CATALOG.md) — ecosystem ownership and maturity status.

## Framework Guides

1. [Core](core.md) — `@ecfjs/core`, `@ecfjs/support`, `@ecfjs/config`, `@ecfjs/events`, and `@ecfjs/contracts`
2. [HTTP](http.md) — `@ecfjs/http`, `@ecfjs/validation`, and `@ecfjs/view`
3. [Database](database.md) — `@ecfjs/database`
4. [Services](services.md) — auth, queues, cache, mail, storage, media, broadcast, notifications, scheduler, and logging
5. [API platform](api-platform.md) — `@ecfjs/api` and `@ecfjs/search`
6. [Devtools](devtools.md) — `@ecfjs/devtools` and `@ecfjs/observability`
7. [Testing](testing.md) — `@ecfjs/testing`
8. [DevKit](devkit.md) — `@ecfjs/devkit`
9. [AI](ai.md) — `@ecfjs/ai`

Every publishable package also contains its own `README.md` and `ARCHITECTURE.md`.

## Governance

- [API stability policy](governance/API_STABILITY_POLICY.md)
- [Dependency rules](governance/DEPENDENCY_RULES.md)
- [Code quality policy](governance/CODE_QUALITY_POLICY.md)
- [CI and release pipeline](governance/CI_RELEASE_PIPELINE.md)
- [Security review checklist](governance/SECURITY_REVIEW_CHECKLIST.md)
