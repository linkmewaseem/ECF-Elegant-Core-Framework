import test from "node:test";
import assert from "node:assert/strict";
import Job from "../../src/core/Job.js";
import JobChain from "../../src/core/JobChain.js";
import JobBatch from "../../src/core/JobBatch.js";

let executed = [];

class Step1Job extends Job {
  async handle() { executed.push("step1"); }
}

class Step2Job extends Job {
  async handle() { executed.push("step2"); }
}

test("JobChain - executes jobs in sequential order", async () => {
  executed = [];
  await JobChain.dispatch([new Step1Job(), new Step2Job()]);
  assert.deepEqual(executed, ["step1", "step2"]);
});

test("JobBatch - tracks parallel job execution and fires then callback", async () => {
  let completedBatch = null;
  executed = [];

  const batch = JobBatch.dispatch([new Step1Job(), new Step2Job()]).then((b) => {
    completedBatch = b;
  });

  await new Promise(r => setTimeout(r, 50));
  assert.ok(completedBatch);
  assert.equal(completedBatch.totalJobs, 2);
  assert.equal(completedBatch.failedJobs, 0);
});
