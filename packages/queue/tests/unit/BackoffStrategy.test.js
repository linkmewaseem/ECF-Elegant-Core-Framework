import test from "node:test";
import assert from "node:assert/strict";
import { FixedBackoff, LinearBackoff, ExponentialBackoff } from "../../src/backoff/BackoffStrategy.js";

test("BackoffStrategy - FixedBackoff returns constant delay", () => {
  const fixed = new FixedBackoff(10);
  assert.equal(fixed.getBackoff(1), 10);
  assert.equal(fixed.getBackoff(5), 10);
});

test("BackoffStrategy - LinearBackoff returns linear multiplier", () => {
  const linear = new LinearBackoff(5);
  assert.equal(linear.getBackoff(1), 5);
  assert.equal(linear.getBackoff(2), 10);
  assert.equal(linear.getBackoff(3), 15);
});

test("BackoffStrategy - ExponentialBackoff calculates exponential progression capped at max", () => {
  const exp = new ExponentialBackoff(2, 30);
  assert.equal(exp.getBackoff(1), 2);   // 2 * 2^0 = 2
  assert.equal(exp.getBackoff(2), 4);   // 2 * 2^1 = 4
  assert.equal(exp.getBackoff(3), 8);   // 2 * 2^2 = 8
  assert.equal(exp.getBackoff(4), 16);  // 2 * 2^3 = 16
  assert.equal(exp.getBackoff(5), 30);  // 2 * 2^4 = 32 capped at 30
});
