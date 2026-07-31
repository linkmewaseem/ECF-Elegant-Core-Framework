import { RateLimiter } from './RateLimiter.js';
import RateLimitException from '../exceptions/RateLimitException.js';

const defaultLimiter = new RateLimiter();

/**
 * Throttling Middleware adding RateLimit headers & raising 429 exceptions.
 */
export class ThrottleRequests {
  constructor(limiter = defaultLimiter) {
    this.limiter = limiter;
  }

  async handle(request, next, maxAttempts = 60, decayMinutes = 1) {
    const key = `${request.ip()}:${request.path()}`;
    const decaySeconds = maxAttempts ? Number(decayMinutes) * 60 : 60;
    const limit = Number(maxAttempts) || 60;

    const { attempts, resetAt } = this.limiter.hit(key, decaySeconds);
    const remaining = Math.max(0, limit - attempts);

    if (attempts > limit) {
      throw new RateLimitException(`Too many attempts. Retry after ${resetAt - Math.ceil(Date.now() / 1000)} seconds.`);
    }

    const response = await next(request);

    if (response && typeof response.header === 'function') {
      response.header('X-RateLimit-Limit', String(limit));
      response.header('X-RateLimit-Remaining', String(remaining));
      response.header('X-RateLimit-Reset', String(resetAt));
    }

    return response;
  }
}
