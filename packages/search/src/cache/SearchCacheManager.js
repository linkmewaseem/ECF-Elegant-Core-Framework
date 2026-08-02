export class SearchCacheManager {
  constructor(cacheDriver = null) {
    this.cacheDriver = cacheDriver;
    this.memoryCache = new Map();
    this.tagMap = new Map();
  }

  async get(key) {
    if (this.cacheDriver && typeof this.cacheDriver.get === "function") {
      return await this.cacheDriver.get(key);
    }
    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  async put(key, value, ttlInSeconds = 300, tags = []) {
    if (this.cacheDriver && typeof this.cacheDriver.put === "function") {
      return await this.cacheDriver.put(key, value, ttlInSeconds);
    }
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlInSeconds * 1000,
    });

    for (const tag of tags) {
      if (!this.tagMap.has(tag)) this.tagMap.set(tag, new Set());
      this.tagMap.get(tag).add(key);
    }
    return true;
  }

  async invalidateTag(tag) {
    if (this.tagMap.has(tag)) {
      const keys = this.tagMap.get(tag);
      for (const k of keys) {
        this.memoryCache.delete(k);
      }
      this.tagMap.delete(tag);
    }
    return true;
  }
}

export default SearchCacheManager;
