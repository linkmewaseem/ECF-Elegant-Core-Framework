import { BaseDriver } from './BaseDriver.js';
import { CircuitBreaker } from '../CircuitBreaker.js';
import { RetryPolicy } from '../RetryPolicy.js';

/**
 * Generic Webhook HTTP POST Driver.
 */
export class WebhookDriver extends BaseDriver {
  constructor(options = {}) {
    super(options);
    this.url = options.url;
    this.headers = options.headers || { 'Content-Type': 'application/json' };

    this.circuitBreaker = new CircuitBreaker({ maxFailures: 3, cooldownMs: 30000 });
    this.retryPolicy = new RetryPolicy({ maxRetries: 2, initialDelayMs: 200 });
  }

  async write(record) {
    if (!this.url) return;

    await this.circuitBreaker.execute(async () => {
      await this.retryPolicy.execute(async () => {
        const payload = typeof record === 'string' ? { message: record } : record;

        const res = await fetch(this.url, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`Webhook error: HTTP ${res.status} ${res.statusText}`);
        }
      });
    });
  }

  getCapabilities() {
    return {
      supportsJson: true,
      supportsBatch: true,
      supportsRetry: true,
      supportsRotation: false,
      supportsCompression: false,
      supportsArchive: false,
    };
  }
}

export default WebhookDriver;
