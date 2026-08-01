import test from "node:test";
import assert from "node:assert/strict";
import Job from "../../src/core/Job.js";
import MemoryDriver from "../../src/drivers/MemoryDriver.js";
import Worker from "../../src/worker/Worker.js";
import FailedJobRepository from "../../src/worker/FailedJobRepository.js";

let executed = false;

class SuccessJob extends Job {
  async handle() { executed = true; }
}

class FailingJob extends Job {
  constructor() {
    super();
    this.tries = 1;
  }
  async handle() { throw new Error("Failing job test error"); }
}

test("Worker - pops job, executes, and logs failures on max tries", async () => {
  const driver = new MemoryDriver();
  const failedRepo = new FailedJobRepository();
  const worker = new Worker(driver, failedRepo);

  // Success job test
  executed = false;
  await driver.push(new SuccessJob());
  const ran = await worker.runNextJob(["default"]);
  assert.equal(ran, true);
  assert.equal(executed, true);

  // Failure job test
  await driver.push(new FailingJob(), { tries: 1 });
  await worker.runNextJob(["default"]);

  const failedJobs = await failedRepo.all();
  assert.equal(failedJobs.length, 1);
  assert.equal(failedJobs[0].exception.message, "Failing job test error");
});
