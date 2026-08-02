import { describe, it } from 'node:test';
import assert from 'node:assert';
import { EcosystemBenchmark } from '../../src/index.js';

describe('Ecosystem Benchmark Suite', () => {
  it('should run full framework performance benchmarks across all core subsystems', async () => {
    const results = await EcosystemBenchmark.runAll({ iterations: 100 });

    assert.ok(results.container.opsPerSec > 0);
    assert.ok(results.router.opsPerSec > 0);
    assert.ok(results.database.opsPerSec > 0);
    assert.ok(results.queue.opsPerSec > 0);
    assert.ok(results.logger.opsPerSec > 0);
    assert.ok(results.search.opsPerSec > 0);
    assert.ok(results.ai.opsPerSec > 0);

    results.container.expectOps(100);
    results.router.expectOps(100);
  });
});
