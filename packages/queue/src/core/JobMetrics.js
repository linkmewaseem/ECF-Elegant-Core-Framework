export class JobMetrics {
  constructor() {
    this.queued = 0;
    this.processed = 0;
    this.failed = 0;
    this.retried = 0;
    this.latencies = [];
  }

  recordQueued() { this.queued++; }
  recordProcessed(durationMs) {
    this.processed++;
    this.latencies.push(durationMs);
    if (this.latencies.length > 1000) this.latencies.shift();
  }
  recordFailed() { this.failed++; }
  recordRetried() { this.retried++; }

  getAverageLatency() {
    if (this.latencies.length === 0) return 0;
    const sum = this.latencies.reduce((a, b) => a + b, 0);
    return Math.round((sum / this.latencies.length) * 100) / 100;
  }

  snapshot() {
    return {
      queued: this.queued,
      processed: this.processed,
      failed: this.failed,
      retried: this.retried,
      averageLatencyMs: this.getAverageLatency()
    };
  }
}

export default JobMetrics;
