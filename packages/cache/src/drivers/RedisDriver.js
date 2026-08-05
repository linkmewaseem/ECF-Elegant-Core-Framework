import MemoryDriver from "./MemoryDriver.js";

export class RedisDriver extends MemoryDriver {
  constructor(client = null, options = {}) {
    super();
    this.client = client;
    this.prefix = options.prefix || "ecf_cache:";
  }

  getKey(key) {
    return `${this.prefix}${key}`;
  }

  async get(key, defaultValue = null) {
    if (this.client && typeof this.client.get === "function") {
      const raw = await this.client.get(this.getKey(key));
      if (raw === null || raw === undefined) return defaultValue;
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }
    return super.get(key, defaultValue);
  }

  async put(key, value, ttlSeconds = 3600) {
    if (this.client && typeof this.client.set === "function") {
      const serialized = typeof value === "object" ? JSON.stringify(value) : String(value);
      if (ttlSeconds && typeof this.client.setex === "function") {
        await this.client.setex(this.getKey(key), ttlSeconds, serialized);
      } else {
        await this.client.set(this.getKey(key), serialized, "EX", ttlSeconds);
      }
      return true;
    }
    return super.put(key, value, ttlSeconds);
  }

  async has(key) {
    if (this.client && typeof this.client.exists === "function") {
      const count = await this.client.exists(this.getKey(key));
      return Boolean(count);
    }
    return super.has(key);
  }

  async forget(key) {
    if (this.client && (typeof this.client.del === "function" || typeof this.client.delete === "function")) {
      const fn = this.client.del ? this.client.del.bind(this.client) : this.client.delete.bind(this.client);
      await fn(this.getKey(key));
      return true;
    }
    return super.forget(key);
  }

  async flush() {
    if (this.client && typeof this.client.flushdb === "function") {
      await this.client.flushdb();
      return true;
    }
    return super.flush();
  }
}

export default RedisDriver;
