import assert from "node:assert/strict";

export class QueueTestingFake {
  constructor() {
    this.pushedJobs = [];
  }

  push(jobInstance, data, queue = "default") {
    this.pushedJobs.push({
      job: jobInstance,
      queue,
      data,
      pushedAt: new Date()
    });
    return true;
  }

  later(delayInSeconds, jobInstance, data, queue = "default") {
    this.pushedJobs.push({
      job: jobInstance,
      queue,
      delay: delayInSeconds,
      data,
      pushedAt: new Date()
    });
    return true;
  }

  assertPushed(jobClass) {
    const className = typeof jobClass === "string" ? jobClass : jobClass.name;
    const found = this.pushedJobs.some(j => j.job.constructor.name === className);
    assert.ok(found, `Expected job '${className}' to be pushed to queue, but it was not found.`);
  }

  assertPushedOn(queue, jobClass) {
    const className = typeof jobClass === "string" ? jobClass : jobClass.name;
    const found = this.pushedJobs.some(j => j.queue === queue && j.job.constructor.name === className);
    assert.ok(found, `Expected job '${className}' to be pushed on queue '${queue}', but it was not found.`);
  }

  assertNotPushed(jobClass) {
    const className = typeof jobClass === "string" ? jobClass : jobClass.name;
    const found = this.pushedJobs.some(j => j.job.constructor.name === className);
    assert.equal(found, false, `Expected job '${className}' NOT to be pushed, but it was found.`);
  }
}

export default QueueTestingFake;
