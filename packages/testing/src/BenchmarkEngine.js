import assert from 'node:assert';

export class BenchmarkResult {
  constructor(metrics) {
    this.name = metrics.name;
    this.iterations = metrics.iterations;
    this.elapsedMs = metrics.elapsedMs;
    this.opsPerSec = metrics.opsPerSec;
    this.avgLatencyMicroSec = metrics.avgLatencyMicroSec;
    this.memoryUsedMb = metrics.memoryUsedMb;
  }

  expectOps(minOps) {
    assert.ok(
      this.opsPerSec >= minOps,
      `[Performance Regression] Benchmark "${this.name}" expected >= ${minOps} ops/sec, but achieved ${this.opsPerSec} ops/sec.`
    );
    return this;
  }

  expectMemory(maxMb) {
    assert.ok(
      this.memoryUsedMb <= maxMb,
      `[Performance Regression] Benchmark "${this.name}" expected <= ${maxMb}MB memory usage, but used ${this.memoryUsedMb}MB.`
    );
    return this;
  }

  expectLatency(maxMicroSec) {
    assert.ok(
      this.avgLatencyMicroSec <= maxMicroSec,
      `[Performance Regression] Benchmark "${this.name}" expected <= ${maxMicroSec}μs latency, but average was ${this.avgLatencyMicroSec}μs.`
    );
    return this;
  }
}

/**
 * High-Precision Benchmark Engine with Performance Regression Assertions.
 */
export class BenchmarkEngine {
  static async run(name, fn, { iterations = 1000, warmup = 10 } = {}) {
    for (let i = 0; i < warmup; i++) {
      await fn();
    }

    const memBefore = process.memoryUsage().heapUsed;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      await fn(i);
    }

    const elapsedMs = performance.now() - start;
    const memAfter = process.memoryUsage().heapUsed;

    const opsPerSec = Math.round((iterations / elapsedMs) * 1000);
    const avgLatencyMicroSec = Number(((elapsedMs / iterations) * 1000).toFixed(2));
    const memoryUsedMb = Number(((memAfter - memBefore) / (1024 * 1024)).toFixed(2));

    const result = new BenchmarkResult({
      name,
      iterations,
      elapsedMs: Number(elapsedMs.toFixed(2)),
      opsPerSec,
      avgLatencyMicroSec,
      memoryUsedMb,
    });

    console.log(
      `[Benchmark] ${name}: ${opsPerSec.toLocaleString()} ops/sec | ${avgLatencyMicroSec}μs avg | ${memoryUsedMb}MB`
    );

    return result;
  }
}

export const benchmark = BenchmarkEngine.run;
export default BenchmarkEngine;
