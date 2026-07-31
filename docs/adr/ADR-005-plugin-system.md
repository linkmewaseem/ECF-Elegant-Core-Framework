# ADR-005: Decoupled Plugin System & Extension Lifecycle

## Status
**Accepted** (Implemented in `@ecf/extensions`)

## Context
Framework features like Soft Deletes, Automatic Timestamps, Sluggable Fields, Audit Logs, and UUID primary keys should not bloat the core ORM engine. They need a modular plugin framework that hooks into model lifecycles dynamically.

## Decision
1. Package extensions under `@ecf/extensions` as independent plugin modules (`@ecf/soft-deletes`, `@ecf/timestamps`, `@ecf/uuids`, `@ecf/sluggable`, `@ecf/audit`).
2. Utilize model lifecycle events (`saving`, `creating`, `updating`, `deleting`, `restoring`) and global scopes to attach behaviors dynamically.
3. Expose a standard plugin lifecycle interface (`install`, `register`, `boot`, `shutdown`, `publish`, `migrations`, `routes`, `views`).

## Consequences

### Positive
- Core ORM (`@ecf/database`) remains lean, fast, and unbloated.
- Developers can opt-in to only the extension behaviors required for their project.
- Third-party extension authors have a standardized plugin contract.

### Negative
- Requires model mixins or macro registration when attaching behaviors.
