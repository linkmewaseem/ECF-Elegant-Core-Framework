# @ecfjs/events — Package Architecture

`@ecfjs/events` is the priority-aware event dispatcher for the ECF ecosystem.

## Core Components

- **`EventDispatcher`**: Dispatches events to registered listeners with priority ordering.
- **`EventManager`**: High-level event registration and dispatch facade.
- **`ListenerRegistry`**: Priority-sorted listener storage and lookup.
- **`EventSubscriber`**: Base class for class-based event subscription.
- **`EventAutoDiscoverer`**: Scans and registers event listeners from directory structures.
- **`ShouldQueue` / `ShouldBroadcast`**: Integration contracts for `@ecfjs/queue` and `@ecfjs/broadcast`.

## Dependencies

- `@ecfjs/core`

## Dependency Rules

- MUST NOT depend on `@ecfjs/http` or `@ecfjs/database`.
- Queue and broadcast integrations are optional peer dependencies via contracts.
