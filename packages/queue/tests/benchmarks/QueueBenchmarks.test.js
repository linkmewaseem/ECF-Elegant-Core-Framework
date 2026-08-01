import test from "node:test";
import assert from "node:assert/strict";
import MemoryDriver from "../../src/drivers/MemoryDriver.js";
import Job from "../../src/core/Job.js";

class BenchmarkJob extends Job {
  async handle() { return true; }
}

test("Benchmark - MemoryDriver push & pop throughput", async () => {
  const driver = new MemoryDriver();
  const start = performance.now();
  const count = 10000;

  for (let i = 0; i < count; i++) {
    await driver.push(new BenchmarkJob({ id: i }));
  }

  for (let i = 0; i < count; i++) {
    await driver.pop(["default"]);
  }

  const elapsed = performance.now() - start;
  const opsPerSec = Math.round(((count * 2) / elapsed) * 1000);
  console.log(`[Benchmark] Queue MemoryDriver throughput: ${opsPerSec} ops/sec (${count * 2} ops in ${elapsed.toFixed(2)}ms)`);
  assert.ok(opsPerSec > 5000);
});
