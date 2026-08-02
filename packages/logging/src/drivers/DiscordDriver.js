import { BaseDriver } from './BaseDriver.js';
import { CircuitBreaker } from '../CircuitBreaker.js';
import { RetryPolicy } from '../RetryPolicy.js';

/**
 * Discord Webhook Driver.
 */
export class DiscordDriver extends BaseDriver {
  constructor(options = {}) {
    super(options);
    this.url = options.url || process.env.DISCORD_WEBHOOK_URL;
    this.username = options.username || 'ECF Logger';

    this.circuitBreaker = new CircuitBreaker({ maxFailures: 3, cooldownMs: 30000 });
    this.retryPolicy = new RetryPolicy({ maxRetries: 2, initialDelayMs: 200 });
  }

  async write(record) {
    if (!this.url) return;

    await this.circuitBreaker.execute(async () => {
      await this.retryPolicy.execute(async () => {
        const text = typeof record === 'string' ? record : `**[${String(record.level).toUpperCase()}]** ${record.message}`;
        const payload = {
          username: this.username,
          content: text,
        };

        const res = await fetch(this.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`Discord webhook error: HTTP ${res.status} ${res.statusText}`);
        }
      });
    });
  }

  getCapabilities() {
    return {
      supportsJson: true,
      supportsBatch: false,
      supportsRetry: true,
      supportsRotation: false,
      supportsCompression: false,
      supportsArchive: false,
    };
  }
}

export default DiscordDriver;
