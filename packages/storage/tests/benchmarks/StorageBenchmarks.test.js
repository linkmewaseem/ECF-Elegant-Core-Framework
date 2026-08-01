import test from "node:test";
import assert from "node:assert/strict";
import MemoryDriver from "../../src/drivers/MemoryDriver.js";

test("Benchmark - MemoryDriver throughput", async () => {
  const driver = new MemoryDriver();
  const start = performance.now();
  const count = 10000;

  for (let i = 0; i < count; i++) {
    await driver.put(`bench/file_${i}.txt`, `Data_${i}`);
    await driver.get(`bench/file_${i}.txt`);
  }

  const elapsed = performance.now() - start;
  const opsPerSec = Math.round((count / elapsed) * 1000);
  console.log(`[Benchmark] Storage MemoryDriver throughput: ${opsPerSec} ops/sec (${count} ops in ${elapsed.toFixed(2)}ms)`);
  assert.ok(opsPerSec > 1000);
});
