import test from "node:test";
import assert from "node:assert/strict";
import NotificationManager from "../../src/internal/NotificationManager.js";
import Notification from "../../src/notification/Notification.js";

class BenchmarkNotification extends Notification {
  via() { return ["database", "log"]; }
  toDatabase() { return { data: "benchmark" }; }
}

test("Benchmark - NotificationManager multi-channel dispatch throughput", async () => {
  const manager = new NotificationManager();
  const start = performance.now();
  const count = 5000;
  const user = { id: 1 };

  for (let i = 0; i < count; i++) {
    await manager.sendNow(user, new BenchmarkNotification());
  }

  const elapsed = performance.now() - start;
  const opsPerSec = Math.round(((count * 2) / elapsed) * 1000);
  console.log(`[Benchmark] Notification dispatch throughput: ${opsPerSec} channel ops/sec (${count * 2} ops in ${elapsed.toFixed(2)}ms)`);
  assert.ok(opsPerSec > 2000);
});
