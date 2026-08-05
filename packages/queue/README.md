# `@ecfjs/queue` — Enterprise Asynchronous Execution Platform

`@ecfjs/queue` is the foundational background job queue platform for the ECF (Enterprise Core Framework) ecosystem.

---

## Features

- ⚡ **Multi-Driver Architecture**: Sync, Memory, Database, Redis.
- 🛡️ **Secure Payload Serializer**: HMAC SHA-256 signatures and payload checksum verification (`v: 1`).
- 🔄 **Advanced Orchestration**: `JobChain` (sequential execution), `JobBatch` (parallel execution tracking), `Job.dispatchSync()`, `Job.dispatch()`.
- 🎛️ **Job Middleware Pipeline**: `WithoutOverlapping`, `RateLimited`, `TimeoutMiddleware`.
- 📈 **Backoff Strategies**: `FixedBackoff`, `LinearBackoff`, `ExponentialBackoff`.
- 👷 **Horizon-Style Worker & Supervisor**: `WorkerSupervisor`, `FailedJobRepository` dead-letter queue, graceful `SIGTERM`/`SIGINT` shutdown.
- 🧪 **Queue Testing Fake**: `Queue.fake()`, `assertPushed()`, `assertPushedOn()`, `assertNotPushed()`.

---

## Quick Start

### 1. Defining a Job

```javascript
import { Job, WithoutOverlapping } from "@ecfjs/queue";

export class ProcessInvoiceJob extends Job {
  constructor(invoiceId) {
    super();
    this.invoiceId = invoiceId;
    this.tries = 3;
  }

  middleware() {
    return [new WithoutOverlapping(this.invoiceId)];
  }

  tags() {
    return [`invoice:${this.invoiceId}`, "billing"];
  }

  async handle() {
    console.log(`Processing invoice ${this.invoiceId}...`);
  }
}

// Dispatch job
await ProcessInvoiceJob.dispatch(42);
```

### 2. Testing Fake

```javascript
import { Queue } from "@ecfjs/queue";

const fakeQueue = Queue.fake();

await ProcessInvoiceJob.dispatch(42);

fakeQueue.assertPushed(ProcessInvoiceJob);
```

---

## License

MIT
