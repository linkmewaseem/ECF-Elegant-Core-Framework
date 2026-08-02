import { createHash } from "node:crypto";

export class ETagMiddleware {
  static generateETag(body) {
    const serialized = typeof body === "string" ? body : JSON.stringify(body);
    const hash = createHash("sha256").update(serialized).digest("hex").slice(0, 16);
    return `W/"${hash}"`;
  }

  async handle(req, res, next) {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return await next();
    }

    const ifNoneMatch = req.headers?.["if-none-match"] || req.headers?.["If-None-Match"];
    const originalJson = res.json?.bind(res);

    if (res && originalJson) {
      res.json = (body) => {
        const etag = ETagMiddleware.generateETag(body);
        res.setHeader("ETag", etag);

        if (ifNoneMatch && ifNoneMatch === etag) {
          res.statusCode = 304;
          return res.end();
        }

        return originalJson(body);
      };
    }

    return await next();
  }
}

export default ETagMiddleware;
