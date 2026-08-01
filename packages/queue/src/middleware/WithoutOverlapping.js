import IJobMiddleware from "../contracts/IJobMiddleware.js";

const activeLocks = new Set();

export class WithoutOverlapping extends IJobMiddleware {
  constructor(key = "default-job-lock") {
    super();
    this.key = key;
  }

  async handle(job, next) {
    const lockKey = typeof this.key === "function" ? this.key(job) : `${job.constructor.name}:${this.key}`;
    if (activeLocks.has(lockKey)) {
      return { skipped: true, reason: `Job lock '${lockKey}' is currently active.` };
    }
    activeLocks.add(lockKey);
    try {
      return await next(job);
    } finally {
      activeLocks.delete(lockKey);
    }
  }
}

export default WithoutOverlapping;
