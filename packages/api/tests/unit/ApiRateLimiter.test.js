import test from "node:test";
import assert from "node:assert/strict";
import { ApiRateLimiter } from "../../src/index.js";

test("ApiRateLimiter: limits requests per window and enforces remaining count", async () => {
  const limiter = new ApiRateLimiter();

  const res1 = await limiter.checkRateLimit("ip_1.2.3.4", 2, 60000);
  assert.equal(res1.allowed, true);
  assert.equal(res1.remaining, 1);

  const res2 = await limiter.checkRateLimit("ip_1.2.3.4", 2, 60000);
  assert.equal(res2.allowed, true);
  assert.equal(res2.remaining, 0);

  const res3 = await limiter.checkRateLimit("ip_1.2.3.4", 2, 60000);
  assert.equal(res3.allowed, false);
});
