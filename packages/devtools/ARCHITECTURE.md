# @ecfjs/devtools — Package Architecture

`@ecfjs/devtools` is the real-time developer debugging platform for the ECF ecosystem.

## Core Components

- **`DevToolsManager`**: Orchestrates collector registration and entry storage.
- **`EntryStore`**: Request-scoped in-memory store for debug entries.
- **Collectors**: Subsystem-specific telemetry collectors (HTTP, Database, Cache, Queue, etc.).
- **DevTools Server**: Serves a browser-based debug dashboard.

## Dependencies

- `@ecfjs/core`
- Peer integrations with all major ECF packages via collector hooks.

## Dependency Rules

- DevTools MUST be disabled in production by default.
- Collectors MUST NOT expose secrets, tokens, or PII in debug entries.
