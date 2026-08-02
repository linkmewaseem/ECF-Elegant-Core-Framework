import { BaseDriver } from './BaseDriver.js';
import { CircuitBreaker } from '../CircuitBreaker.js';
import { RetryPolicy } from '../RetryPolicy.js';

/**
 * Elasticsearch / OpenSearch Log Ingestion Driver.
 */
export class ElasticDriver extends BaseDriver {
  constructor(options = {}) {
    super(options);
    this.endpoint = options.endpoint || process.env.ELASTIC_URL || 'http://localhost:9200';
    this.index = options.index || 'ecf-logs';
    this.headers = options.headers || { 'Content-Type': 'application/json' };

    this.circuitBreaker = new CircuitBreaker({ maxFailures: 5, cooldownMs: 60000 });
    this.retryPolicy = new RetryPolicy({ maxRetries: 3, initialDelayMs: 300 });
  }

  async write(record) {
    if (!this.endpoint) return;

    await this.circuitBreaker.execute(async () => {
      await this.retryPolicy.execute(async () => {
        const doc = typeof record === 'string' ? { message: record, timestamp: new Date().toISOString() } : record;
        const targetUrl = `${this.endpoint.replace(/\/$/, '')}/${this.index}/_doc`;

        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(doc),
        });

        if (!res.ok) {
          throw new Error(`Elasticsearch ingestion error: HTTP ${res.status} ${res.statusText}`);
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

export default ElasticDriver;
