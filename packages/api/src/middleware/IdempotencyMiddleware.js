import { createHash } from "node:crypto";

export class IdempotencyMiddleware {
  constructor(cacheDriver = null, ttlSeconds = 86400) {
    this.cacheDriver = cacheDriver;
    this.ttlSeconds = ttlSeconds;
    this.memoryStore = new Map();
  }

  async handle(req, res, next) {
    const key = req.headers?.["idempotency-key"] || req.headers?.["Idempotency-Key"];

    if (!key || (req.method !== "POST" && req.method !== "PATCH")) {
      return await next();
    }

    const storageKey = `idempotency:${key}`;

    let cached = null;
    if (this.cacheDriver && typeof this.cacheDriver.get === "function") {
      cached = await this.cacheDriver.get(storageKey);
    } else {
      cached = this.memoryStore.get(storageKey);
    }

    if (cached) {
      if (res && typeof res.setHeader === "function" && typeof res.status === "function") {
        res.setHeader("X-Idempotent-Replay", "true");
        return res.status(cached.status).json(cached.body);
      }
      return cached.body;
    }

    const originalJson = res.json?.bind(res);
    let capturedBody = null;
    let capturedStatus = 200;

    if (res && originalJson) {
      res.json = (body) => {
        capturedBody = body;
        capturedStatus = res.statusCode || 200;

        const record = { status: capturedStatus, body: capturedBody, timestamp: Date.now() };

        if (this.cacheDriver && typeof this.cacheDriver.put === "function") {
          this.cacheDriver.put(storageKey, record, this.ttlSeconds);
        } else {
          this.memoryStore.set(storageKey, record);
        }

        return originalJson(body);
      };
    }

    return await next();
  }
}

export default IdempotencyMiddleware;
