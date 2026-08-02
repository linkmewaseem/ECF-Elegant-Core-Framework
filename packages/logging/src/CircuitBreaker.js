/**
 * Circuit Breaker for remote log transport drivers.
 * Prevents downstream driver failures from slowing down core app execution.
 */
export class CircuitBreaker {
  constructor({ maxFailures = 5, cooldownMs = 60000 } = {}) {
    this.maxFailures = maxFailures;
    this.cooldownMs = cooldownMs;
    this.failureCount = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF-OPEN
    this.nextAttempt = 0;
  }

  /**
   * Execute action protected by circuit breaker.
   * @param {Function} action
   * @returns {Promise<any>}
   */
  async execute(action) {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF-OPEN';
      } else {
        const err = new Error(`Circuit breaker is OPEN. Fast failing driver action.`);
        err.isCircuitOpen = true;
        throw err;
      }
    }

    try {
      const result = await action();
      this.recordSuccess();
      return result;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }

  recordSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure() {
    this.failureCount++;
    if (this.failureCount >= this.maxFailures) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.cooldownMs;
    }
  }

  isOpen() {
    if (this.state === 'OPEN' && Date.now() > this.nextAttempt) {
      this.state = 'HALF-OPEN';
      return false;
    }
    return this.state === 'OPEN';
  }
}

export default CircuitBreaker;
