export class RetryPolicy {
  constructor(type = "exponential", maxAttempts = 3, initialDelayMs = 100) {
    this.type = type;
    this.maxAttempts = maxAttempts;
    this.initialDelayMs = initialDelayMs;
  }

  getDelay(attempt) {
    if (attempt >= this.maxAttempts) return -1;
    switch (this.type) {
      case "fixed":
        return this.initialDelayMs;
      case "linear":
        return this.initialDelayMs * attempt;
      case "exponential":
        return this.initialDelayMs * Math.pow(2, attempt - 1);
      case "none":
      default:
        return -1;
    }
  }

  async execute(fn) {
    let attempt = 1;
    while (true) {
      try {
        return await fn(attempt);
      } catch (err) {
        const delay = this.getDelay(attempt);
        if (delay < 0) throw err;
        await new Promise((res) => setTimeout(res, delay));
        attempt++;
      }
    }
  }
}

export default RetryPolicy;
