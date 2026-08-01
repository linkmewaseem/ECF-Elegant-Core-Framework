import IJobMiddleware from "../contracts/IJobMiddleware.js";

const rateBuckets = new Map(); // key -> timestamps[]

export class RateLimited extends IJobMiddleware {
  constructor(maxAttempts = 10, decaySeconds = 60, key = "default-rate-key") {
    super();
    this.maxAttempts = maxAttempts;
    this.decayMs = decaySeconds * 1000;
    this.key = key;
  }

  async handle(job, next) {
    const now = Date.now();
    const bucketKey = typeof this.key === "function" ? this.key(job) : this.key;

    let timestamps = rateBuckets.get(bucketKey) || [];
    timestamps = timestamps.filter(ts => now - ts < this.decayMs);

    if (timestamps.length >= this.maxAttempts) {
      return { skipped: true, reason: `Rate limit of ${this.maxAttempts} per ${this.decayMs / 1000}s exceeded.` };
    }

    timestamps.push(now);
    rateBuckets.set(bucketKey, timestamps);

    return next(job);
  }
}

export default RateLimited;
