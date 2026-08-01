export class JobChain {
  constructor(jobs = []) {
    this.jobs = jobs;
  }

  static dispatch(jobs = []) {
    const chain = new JobChain(jobs);
    return chain.run();
  }

  async run() {
    for (const job of this.jobs) {
      if (job.cancelled) break;
      if (typeof job.handle === "function") {
        await job.handle();
      }
    }
    return true;
  }
}

export default JobChain;
