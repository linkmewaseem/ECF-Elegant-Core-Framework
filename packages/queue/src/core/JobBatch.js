import crypto from "node:crypto";

export class JobBatch {
  constructor(jobs = []) {
    this.id = `batch_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    this.jobs = jobs;
    this.totalJobs = jobs.length;
    this.pendingJobs = jobs.length;
    this.failedJobs = 0;
    this.thenCallback = null;
    this.catchCallback = null;
  }

  static dispatch(jobs = []) {
    const batch = new JobBatch(jobs);
    setImmediate(() => batch.run());
    return batch;
  }

  then(callback) {
    this.thenCallback = callback;
    return this;
  }

  catch(callback) {
    this.catchCallback = callback;
    return this;
  }

  async run() {
    const results = await Promise.allSettled(
      this.jobs.map(async (job) => {
        if (typeof job.handle === "function") {
          return job.handle();
        }
      })
    );

    let hasError = false;
    for (const res of results) {
      if (res.status === "rejected") {
        this.failedJobs++;
        hasError = true;
        if (this.catchCallback) {
          this.catchCallback(res.reason, this);
        }
      }
    }

    if (!hasError && this.thenCallback) {
      this.thenCallback(this);
    }
    return this;
  }
}

export default JobBatch;
