# `@ecfjs/scheduler` — Cron & Task Scheduling Platform

`@ecfjs/scheduler` is the cron-based task scheduling platform for the ECF (Elegant Core Framework) ecosystem.

---

## Features

- **ScheduleManager** — fluent cron expression scheduling
- **CronParser** — standard cron syntax parsing
- **ScheduleMutex** — prevents overlapping task execution
- **ScheduleFake** — testing fake for scheduled task assertions

---

## Quick Start

```javascript
import { Schedule } from "@ecfjs/scheduler";

Schedule.call(() => console.log("Every minute"))
  .everyMinute();

Schedule.call(async () => await sendReports())
  .dailyAt("08:00");
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — package architecture

---

## License

MIT
