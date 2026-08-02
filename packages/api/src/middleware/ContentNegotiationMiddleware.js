export class ContentNegotiationMiddleware {
  async handle(req, res, next) {
    const accept = req.headers?.["accept"] || req.headers?.["Accept"] || "application/json";

    req.acceptsJson = accept.includes("application/json") || accept.includes("application/problem+json") || accept.includes("*/*");

    if (res && typeof res.setHeader === "function") {
      res.setHeader("Vary", "Accept, Accept-Encoding");
    }

    return await next();
  }
}

export default ContentNegotiationMiddleware;
