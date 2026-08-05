# @ecfjs/testing — Package Architecture

`@ecfjs/testing` is the DI-aware test platform for the ECF ecosystem.

## Core Components

- **`TestRunner`**: Wraps `node:test` with ECF-specific lifecycle hooks.
- **`TestApplication`**: Creates isolated Application instances with fake bindings.
- **`TestHttpClient`**: Sends HTTP requests against the in-process kernel.
- **`TestDatabase`**: Provisions in-memory SQLite databases for model tests.
- **`FakesOrchestrator`**: Registers and resets fakes across packages.
- **`TimeTravel`**: Freezes and advances system time for deterministic tests.
- **`BenchmarkEngine`**: Runs and reports package-level performance benchmarks.
- **`ContractAssert`**: Validates public API contract conformance.

## Dependencies

- `@ecfjs/core`
- Peer integrations with `@ecfjs/http`, `@ecfjs/database`, `@ecfjs/queue`, `@ecfjs/cache`

## Dependency Rules

- Testing utilities MUST NOT modify production package source code.
- Fakes MUST implement the same public API surface as the real service.
