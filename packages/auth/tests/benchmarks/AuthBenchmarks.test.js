import test from "node:test";
import assert from "node:assert/strict";
import PasswordHasher from "../../src/authentication/passwords/PasswordHasher.js";
import JwtTokenService from "../../src/authentication/tokens/JwtTokenService.js";
import Gate from "../../src/authorization/Gate.js";

test("Benchmark - PasswordHasher throughput & latency", async () => {
  const hasher = new PasswordHasher({ cost: 4096 }); // Low cost for quick test run
  const start = performance.now();
  const count = 5;

  for (let i = 0; i < count; i++) {
    const hash = await hasher.make(`BenchmarkPass_${i}`);
    await hasher.check(`BenchmarkPass_${i}`, hash);
  }

  const elapsed = performance.now() - start;
  console.log(`[Benchmark] ${count} scrypt hash + verify operations completed in ${elapsed.toFixed(2)}ms`);
  assert.ok(elapsed > 0);
});

test("Benchmark - JwtTokenService throughput", async () => {
  const jwt = new JwtTokenService({ secret: "benchmark-jwt-secret-key" });
  const start = performance.now();
  const count = 1000;

  for (let i = 0; i < count; i++) {
    const token = jwt.encode({ sub: `user_${i}`, role: "admin" });
    await jwt.decode(token);
  }

  const elapsed = performance.now() - start;
  const opsPerSec = Math.round((count / elapsed) * 1000);
  console.log(`[Benchmark] JWT encode + decode ops/sec: ${opsPerSec} (${count} ops in ${elapsed.toFixed(2)}ms)`);
  assert.ok(opsPerSec > 100, "JWT throughput should exceed 100 ops/sec");
});

test("Benchmark - Gate permission evaluation throughput", async () => {
  const gate = new Gate();
  gate.define("view-post", (user, post) => user.id === post.userId);

  const user = { id: 100 };
  const post = { userId: 100 };
  const start = performance.now();
  const count = 10000;

  for (let i = 0; i < count; i++) {
    await gate.allows(user, "view-post", post);
  }

  const elapsed = performance.now() - start;
  const opsPerSec = Math.round((count / elapsed) * 1000);
  console.log(`[Benchmark] Gate evaluation ops/sec: ${opsPerSec} (${count} ops in ${elapsed.toFixed(2)}ms)`);
  assert.ok(opsPerSec > 1000, "Gate throughput should exceed 1,000 ops/sec");
});
