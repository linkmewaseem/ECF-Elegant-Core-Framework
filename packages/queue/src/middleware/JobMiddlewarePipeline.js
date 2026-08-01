export class JobMiddlewarePipeline {
  constructor(middlewares = []) {
    this.middlewares = middlewares;
  }

  async process(jobInstance) {
    let index = 0;

    const next = async (job) => {
      if (index >= this.middlewares.length) {
        return job.handle();
      }
      const middleware = this.middlewares[index++];
      return middleware.handle(job, next);
    };

    return next(jobInstance);
  }
}

export default JobMiddlewarePipeline;
