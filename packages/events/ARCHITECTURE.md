# @ecf/events — Package Architecture

`@ecf/events` is the priority-aware event dispatcher for the ECF ecosystem.

## Core Components

- **`EventDispatcher`**: Dispatches events to registered listeners with priority ordering.
- **`EventManager`**: High-level event registration and dispatch facade.
- **`ListenerRegistry`**: Priority-sorted listener storage and lookup.
- **`EventSubscriber`**: Base class for class-based event subscription.
- **`EventAutoDiscoverer`**: Scans and registers event listeners from directory structures.
- **`ShouldQueue` / `ShouldBroadcast`**: Integration contracts for `@ecf/queue` and `@ecf/broadcast`.

## Dependencies

- `@ecf/core`

## Dependency Rules

- MUST NOT depend on `@ecf/http` or `@ecf/database`.
- Queue and broadcast integrations are optional peer dependencies via contracts.
