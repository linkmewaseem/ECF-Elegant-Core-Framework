# @ecf/scheduler — Package Architecture

`@ecf/scheduler` is the cron-based task scheduling platform for the ECF ecosystem.

## Core Components

- **`ScheduleManager`**: Registers and dispatches scheduled tasks.
- **`CronParser`**: Parses and evaluates standard cron expressions.
- **`ScheduleMutex`**: Distributed lock preventing concurrent task overlap.
- **`ScheduleFake`**: Testing fake for asserting scheduled task registration.

## Dependencies

- `@ecf/core`
- Optional integration with `@ecf/queue` for queued scheduled tasks.

## Dependency Rules

- Scheduled tasks MUST be idempotent or protected by `ScheduleMutex`.
