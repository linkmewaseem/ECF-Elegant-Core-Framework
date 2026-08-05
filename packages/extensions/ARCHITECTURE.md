# @ecfjs/extensions Architecture

## Goals

- Keep extension modules small and composable
- Provide feature-level helpers without coupling to the core runtime
- Make it easy to add capability modules in a consistent way

## Structure

- audit/: release and compatibility notes for extension packages
- sluggable/: slug generation helpers
- soft-deletes/: soft-delete behavior helpers
- timestamps/: timestamp-related helpers
- uuids/: UUID generation helpers

## Design Principles

- Avoid direct runtime coupling to application infrastructure
- Prefer small, focused modules with clear contracts
- Support optional composition rather than mandatory framework integration
