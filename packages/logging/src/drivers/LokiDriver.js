import { BaseDriver } from './BaseDriver.js';
import { CircuitBreaker } from '../CircuitBreaker.js';
import { RetryPolicy } from '../RetryPolicy.js';

/**
 * Grafana Loki Log Ingestion Driver (/loki/api/v1/push).
 */
export class LokiDriver extends BaseDriver {
  constructor(options = {}) {
    super(options);
    this.endpoint = options.endpoint || process.env.LOKI_URL || 'http://localhost:3100';
    this.labels = options.labels || { app: 'ecf', env: 'production' };
    this.headers = options.headers || { 'Content-Type': 'application/json' };

    this.circuitBreaker = new CircuitBreaker({ maxFailures: 5, cooldownMs: 60000 });
    this.retryPolicy = new RetryPolicy({ maxRetries: 3, initialDelayMs: 300 });
  }

  async write(record) {
    if (!this.endpoint) return;

    await this.circuitBreaker.execute(async () => {
      await this.retryPolicy.execute(async () => {
        const nanoTimestamp = String(BigInt(Date.now()) * 1000000n);
        const lineStr = typeof record === 'string' ? record : JSON.stringify(record);

        const payload = {
          streams: [
            {
              stream: { ...this.labels, level: String(record?.level || 'info') },
              values: [[nanoTimestamp, lineStr]],
            },
          ],
        };

        const targetUrl = `${this.endpoint.replace(/\/$/, '')}/loki/api/v1/push`;

        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`Grafana Loki push error: HTTP ${res.status} ${res.statusText}`);
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

export default LokiDriver;
