import test from "node:test";
import assert from "node:assert/strict";
import Job from "../../src/core/Job.js";
import JobMiddlewarePipeline from "../../src/middleware/JobMiddlewarePipeline.js";
import WithoutOverlapping from "../../src/middleware/WithoutOverlapping.js";
import RateLimited from "../../src/middleware/RateLimited.js";
import TimeoutMiddleware from "../../src/middleware/TimeoutMiddleware.js";
import { JobTimeoutException } from "../../src/exceptions/QueueException.js";

class SlowJob extends Job {
  async handle() {
    await new Promise(r => setTimeout(r, 100));
    return "done";
  }
}

test("WithoutOverlapping - prevents concurrent execution of same job lock key", async () => {
  const middleware = new WithoutOverlapping("unique-key");
  const job = new SlowJob();

  const pipeline1 = new JobMiddlewarePipeline([middleware]);
  const pipeline2 = new JobMiddlewarePipeline([middleware]);

  const promise1 = pipeline1.process(job);
  const result2 = await pipeline2.process(job);

  assert.equal(result2.skipped, true);
  await promise1;
});

test("RateLimited - limits job execution rate", async () => {
  const middleware = new RateLimited(2, 60, "rate-limit-test");
  const job = new SlowJob();
  const pipeline = new JobMiddlewarePipeline([middleware]);

  await pipeline.process(job);
  await pipeline.process(job);

  const res3 = await pipeline.process(job);
  assert.equal(res3.skipped, true);
});

test("TimeoutMiddleware - throws JobTimeoutException if job execution exceeds timeout", async () => {
  const middleware = new TimeoutMiddleware(0.05); // 50ms
  const job = new SlowJob(); // 100ms
  const pipeline = new JobMiddlewarePipeline([middleware]);

  await assert.rejects(async () => {
    await pipeline.process(job);
  }, JobTimeoutException);
});
