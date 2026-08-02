import { randomUUID } from "node:crypto";

export class CorrelationIdMiddleware {
  async handle(req, res, next) {
    const requestId = req.headers?.["x-request-id"] || req.headers?.["X-Request-ID"] || `req_${randomUUID()}`;
    const correlationId = req.headers?.["x-correlation-id"] || req.headers?.["X-Correlation-ID"] || requestId;

    req.requestId = requestId;
    req.correlationId = correlationId;

    if (res && typeof res.setHeader === "function") {
      res.setHeader("X-Request-ID", requestId);
      res.setHeader("X-Correlation-ID", correlationId);
    }

    return await next();
  }
}

export default CorrelationIdMiddleware;
