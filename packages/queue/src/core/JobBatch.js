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
    this.completed = false;
  }

  static dispatch(jobs = []) {
    const batch = new JobBatch(jobs);
    setImmediate(() => batch.run());
    return batch;
  }

  then(callback) {
    if (typeof callback === "function" && !this.completed) {
      this.thenCallback = callback;
    }
    return this;
  }

  catch(callback) {
    if (typeof callback === "function" && !this.completed) {
      this.catchCallback = callback;
    }
    return this;
  }

  async run() {
    if (this.completed) return this.result;

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

    this.completed = true;

    this.result = {
      id: this.id,
      jobs: this.jobs,
      totalJobs: this.totalJobs,
      pendingJobs: this.pendingJobs,
      failedJobs: this.failedJobs,
      run: () => Promise.resolve(this.result),
    };

    if (!hasError && this.thenCallback) {
      this.thenCallback(this.result);
    }

    return this.result;
  }
}

export default JobBatch;


