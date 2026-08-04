# @ecf/skeleton — Package Architecture

`@ecf/skeleton` is the application scaffolding and integration test harness for the ECF ecosystem.

## Core Components

- **`SkeletonApplication`**: Pre-configured Application with core providers registered.
- **Integration Tests**: Cross-package validation suite (Core + HTTP, HTTP + View, etc.).
- **Directory Conventions**: Standard app layout for generators and CLI scaffolding.

## Dependencies

- `@ecf/core`
- `@ecf/http`
- Peer integrations with all major ECF packages for integration testing.

## Dependency Rules

- Skeleton is a consumer package; it MUST NOT be imported by core infrastructure packages.
