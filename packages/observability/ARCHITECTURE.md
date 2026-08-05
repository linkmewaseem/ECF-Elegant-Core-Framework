# @ecfjs/observability — Package Architecture

`@ecfjs/observability` is the distributed tracing and metrics platform for the ECF ecosystem.

## Core Components

- **`ObservabilityManager`**: Driver resolution and telemetry lifecycle orchestration.
- **`Tracer`**: Creates and manages trace spans with parent/child relationships.
- **`Span`**: Individual trace segment with tags, logs, and timing data.
- **Export Adapters**: OpenTelemetry-compatible trace and metric exporters.

## Dependencies

- `@ecfjs/core`

## Dependency Rules

- MUST NOT depend on `@ecfjs/http` directly; integrates via middleware hooks.
- Trace context MUST propagate through AsyncLocalStorage.
