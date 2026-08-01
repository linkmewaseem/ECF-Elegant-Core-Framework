import test from "node:test";
import assert from "node:assert/strict";
import MemoryTransport from "../../src/transports/MemoryTransport.js";
import MailMessage from "../../src/internal/MailMessage.js";

test("Benchmark - MemoryTransport mail dispatch throughput", async () => {
  const transport = new MemoryTransport();
  const start = performance.now();
  const count = 10000;

  for (let i = 0; i < count; i++) {
    const message = new MailMessage({
      envelope: { to: `user_${i}@example.com`, subject: `Benchmark Mail ${i}` },
      content: { html: `<h1>Email #${i}</h1>` }
    });
    await transport.send(message);
  }

  const elapsed = performance.now() - start;
  const opsPerSec = Math.round((count / elapsed) * 1000);
  console.log(`[Benchmark] Mail MemoryTransport throughput: ${opsPerSec} ops/sec (${count} ops in ${elapsed.toFixed(2)}ms)`);
  assert.ok(opsPerSec > 5000);
});
