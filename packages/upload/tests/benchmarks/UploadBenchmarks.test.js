import test from "node:test";
import assert from "node:assert/strict";
import MagicByteSniffer from "../../src/core/MagicByteSniffer.js";

test("Benchmark - MagicByteSniffer throughput", async () => {
  const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
  const start = performance.now();
  const count = 100000;

  for (let i = 0; i < count; i++) {
    MagicByteSniffer.sniff(buffer);
  }

  const elapsed = performance.now() - start;
  const opsPerSec = Math.round((count / elapsed) * 1000);
  console.log(`[Benchmark] MagicByteSniffer throughput: ${opsPerSec} ops/sec (${count} ops in ${elapsed.toFixed(2)}ms)`);
  assert.ok(opsPerSec > 10000);
});
