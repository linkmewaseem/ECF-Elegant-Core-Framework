import IWorker from "../contracts/IWorker.js";
import JobMiddlewarePipeline from "../middleware/JobMiddlewarePipeline.js";
import { ExponentialBackoff } from "../backoff/BackoffStrategy.js";

export class Worker extends IWorker {
  constructor(queueDriver, failedRepository = null, eventDispatcher = null) {
    super();
    this.driver = queueDriver;
    this.failedRepository = failedRepository;
    this.eventDispatcher = eventDispatcher;
    this.stopped = false;
    this.backoffStrategy = new ExponentialBackoff();
  }

  async runNextJob(queues = ["critical", "high", "default", "low", "background"]) {
    const payload = await this.driver.pop(queues);
    if (!payload) return false;

    const start = performance.now();
    const jobInstance = payload.jobInstance || { handle: () => {} };

    try {
      this.dispatchEvents("JobProcessingEvent", { payload });

      const middlewares = typeof jobInstance.middleware === "function" ? jobInstance.middleware() : [];
      const pipeline = new JobMiddlewarePipeline(middlewares);

      await pipeline.process(jobInstance);

      const duration = performance.now() - start;
      this.dispatchEvents("JobProcessedEvent", { payload, duration });
      return true;
    } catch (err) {
      payload.attempts = (payload.attempts || 0) + 1;

      if (payload.attempts < payload.maxTries) {
        const backoffSec = this.backoffStrategy.getBackoff(payload.attempts);
        this.dispatchEvents("JobRetryingEvent", { payload, attempt: payload.attempts, backoffSec });
        await this.driver.later(backoffSec, jobInstance, { queue: payload.queue, attempts: payload.attempts });
      } else {
        this.dispatchEvents("JobFailedEvent", { payload, error: err.message });
        if (this.failedRepository) {
          await this.failedRepository.log(this.driver.name(), payload.queue, payload, err);
        }
      }
      return false;
    }
  }

  async daemon(queues = ["default"], intervalMs = 100) {
    this.stopped = false;
    this.dispatchEvents("WorkerStartedEvent", { queues });

    while (!this.stopped) {
      const ran = await this.runNextJob(queues);
      if (!ran) {
        await new Promise(r => setTimeout(r, intervalMs));
      }
    }

    this.dispatchEvents("WorkerStoppedEvent", { queues });
  }

  stop() {
    this.stopped = true;
  }

  dispatchEvents(eventName, payload) {
    if (this.eventDispatcher && typeof this.eventDispatcher.dispatch === "function") {
      this.eventDispatcher.dispatch(eventName, payload);
    }
  }
}

export default Worker;
