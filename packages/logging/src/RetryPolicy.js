/**
 * Exponential Backoff Retry Policy for network/remote drivers.
 */
export class RetryPolicy {
  constructor({ maxRetries = 3, initialDelayMs = 500, backoffFactor = 2 } = {}) {
    this.maxRetries = maxRetries;
    this.initialDelayMs = initialDelayMs;
    this.backoffFactor = backoffFactor;
  }

  /**
   * Execute action with exponential backoff retries.
   * @param {Function} action
   * @returns {Promise<any>}
   */
  async execute(action) {
    let attempt = 0;
    let delay = this.initialDelayMs;

    while (attempt <= this.maxRetries) {
      try {
        return await action();
      } catch (err) {
        attempt++;
        if (attempt > this.maxRetries) {
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= this.backoffFactor;
      }
    }
  }
}

export default RetryPolicy;
