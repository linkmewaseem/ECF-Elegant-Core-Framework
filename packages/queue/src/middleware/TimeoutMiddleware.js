import IJobMiddleware from "../contracts/IJobMiddleware.js";
import { JobTimeoutException } from "../exceptions/QueueException.js";

export class TimeoutMiddleware extends IJobMiddleware {
  constructor(timeoutSeconds = 30) {
    super();
    this.timeoutMs = timeoutSeconds * 1000;
    this.timeoutSeconds = timeoutSeconds;
  }

  async handle(job, next) {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new JobTimeoutException(job.constructor.name, this.timeoutSeconds));
      }, this.timeoutMs);
    });

    try {
      return await Promise.race([next(job), timeoutPromise]);
    } finally {
      clearTimeout(timer);
    }
  }
}

export default TimeoutMiddleware;
