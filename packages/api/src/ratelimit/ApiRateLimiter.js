export class ApiRateLimiter {
  constructor(cacheDriver = null) {
    this.cacheDriver = cacheDriver;
    this.memoryStore = new Map();
  }

  getStorageKey(key) {
    return `rate_limit:${key}`;
  }

  async checkRateLimit(key, limit = 60, windowMs = 60000) {
    const storageKey = this.getStorageKey(key);
    const now = Date.now();

    if (this.cacheDriver && typeof this.cacheDriver.get === "function") {
      const record = (await this.cacheDriver.get(storageKey)) || { count: 0, resetAt: now + windowMs };
      if (now > record.resetAt) {
        record.count = 1;
        record.resetAt = now + windowMs;
      } else {
        record.count++;
      }
      await this.cacheDriver.put(storageKey, record, Math.ceil(windowMs / 1000));
      return {
        allowed: record.count <= limit,
        limit,
        remaining: Math.max(0, limit - record.count),
        resetAt: record.resetAt,
      };
    }

    let record = this.memoryStore.get(storageKey);
    if (!record || now > record.resetAt) {
      record = { count: 0, resetAt: now + windowMs };
    }
    record.count++;
    this.memoryStore.set(storageKey, record);

    return {
      allowed: record.count <= limit,
      limit,
      remaining: Math.max(0, limit - record.count),
      resetAt: record.resetAt,
    };
  }

  resolveKey(req, by = "ip") {
    switch (by) {
      case "user":
        return req.user?.id ? `user_${req.user.id}` : `ip_${req.ip || "127.0.0.1"}`;
      case "token":
        return req.token || req.headers?.authorization || `ip_${req.ip || "127.0.0.1"}`;
      case "route":
        return `route_${req.path || req.url}`;
      case "ip":
      default:
        return `ip_${req.ip || req.socket?.remoteAddress || "127.0.0.1"}`;
    }
  }
}

export default ApiRateLimiter;
