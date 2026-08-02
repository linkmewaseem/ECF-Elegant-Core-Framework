import ProblemDetailsResponse from "../../response/ProblemDetailsResponse.js";

export class RateLimitMiddleware {
  constructor(rateLimiter, limit = 60, windowMs = 60000, by = "ip") {
    this.rateLimiter = rateLimiter;
    this.limit = limit;
    this.windowMs = windowMs;
    this.by = by;
  }

  async handle(req, res, next) {
    const key = this.rateLimiter.resolveKey(req, this.by);
    const result = await this.rateLimiter.checkRateLimit(key, this.limit, this.windowMs);

    if (res && typeof res.setHeader === "function") {
      res.setHeader("X-RateLimit-Limit", result.limit);
      res.setHeader("X-RateLimit-Remaining", result.remaining);
      res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetAt / 1000));
    }

    if (!result.allowed) {
      const problem = ProblemDetailsResponse.create({
        status: 429,
        title: "Too Many Requests",
        detail: `Rate limit of ${this.limit} requests per minute exceeded.`,
        type: "https://errors.ecf.dev/too-many-requests",
      });

      if (res && typeof res.status === "function") {
        return res.status(429).json(problem.toProblemDetails());
      }
      return problem.toProblemDetails();
    }

    return await next();
  }
}

export default RateLimitMiddleware;
