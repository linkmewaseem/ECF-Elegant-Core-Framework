import IBroadcastMiddleware from "../../contracts/IBroadcastMiddleware.js";

export class RateLimitMiddleware extends IBroadcastMiddleware {
  constructor(authorizer = null, maxReqPerMin = 1000) {
    super();
    this.authorizer = authorizer;
    this.maxReqPerMin = maxReqPerMin;
  }

  async handle(message, next) {
    if (this.authorizer) {
      const allowed = this.authorizer.checkRateLimit(message.channel, this.maxReqPerMin);
      if (!allowed) {
        throw new Error(`Broadcast rate limit exceeded for channel [${message.channel}]`);
      }
    }
    return await next(message);
  }
}

export default RateLimitMiddleware;
