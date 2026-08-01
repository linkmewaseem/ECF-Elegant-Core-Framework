import MemoryDriver from "./drivers/MemoryDriver.js";
import FileDriver from "./drivers/FileDriver.js";
import RedisDriver from "./drivers/RedisDriver.js";
import NullDriver from "./drivers/NullDriver.js";
import TaggedCache from "./TaggedCache.js";
import CacheLock from "./CacheLock.js";
import CacheStampedeProtection from "./CacheStampedeProtection.js";

export class CacheManager {
  constructor(defaultStore = "memory", eventsManager = null) {
    this.defaultStoreName = defaultStore;
    this.events = eventsManager;
    this.stores = new Map();
    this.stampedeProtection = new CacheStampedeProtection();

    // Register built-in drivers
    this.stores.set("memory", new MemoryDriver());
    this.stores.set("file", new FileDriver());
    this.stores.set("redis", new RedisDriver());
    this.stores.set("null", new NullDriver());
  }

  store(name = null) {
    const storeName = name || this.defaultStoreName;
    const store = this.stores.get(storeName);
    if (!store) {
      throw new Error(`Cache store [${storeName}] is not configured.`);
    }
    return store;
  }

  driver(name = null) {
    return this.store(name);
  }

  get(key, defaultValue = null) {
    const value = this.store().get(key, defaultValue);
    if (this.events) {
      if (value !== defaultValue) {
        this.events.dispatch("CacheHit", { key, value });
      } else {
        this.events.dispatch("CacheMissed", { key });
      }
    }
    return value;
  }

  put(key, value, ttlSeconds = 0) {
    const result = this.store().put(key, value, ttlSeconds);
    if (this.events && result) {
      this.events.dispatch("CacheWritten", { key, value, ttlSeconds });
    }
    return result;
  }

  has(key) {
    return this.store().has(key);
  }

  forget(key) {
    const result = this.store().forget(key);
    if (this.events && result) {
      this.events.dispatch("CacheDeleted", { key });
    }
    return result;
  }

  flush() {
    const result = this.store().flush();
    if (this.events && result) {
      this.events.dispatch("CacheFlushed", {});
    }
    return result;
  }

  async remember(key, ttlSeconds, callback) {
    if (typeof ttlSeconds === "function") {
      callback = ttlSeconds;
      ttlSeconds = 0;
    }

    const existing = this.get(key, undefined);
    if (existing !== undefined && existing !== null) {
      return existing;
    }

    return this.stampedeProtection.execute(key, async () => {
      const current = this.get(key, undefined);
      if (current !== undefined && current !== null) {
        return current;
      }
      const freshValue = await callback();
      if (freshValue !== undefined) {
        this.put(key, freshValue, ttlSeconds || 0);
      }
      return freshValue;
    });
  }



  async rememberForever(key, callback) {
    return this.remember(key, 0, callback);
  }

  async flexible(key, [staleTtl, maxTtl], callback) {
    const cached = this.get(key, null);
    if (cached !== null) {
      // Re-evaluate in background if stale
      setTimeout(async () => {
        try {
          const fresh = await callback();
          this.put(key, fresh, maxTtl);
        } catch (e) {}
      }, 0);
      return cached;
    }

    const fresh = await callback();
    this.put(key, fresh, maxTtl);
    return fresh;
  }

  tags(tagList) {
    const store = this.store();
    if (!store.supportsTags()) {
      throw new Error(`Cache store [${this.defaultStoreName}] does not support tags.`);
    }
    return new TaggedCache(store, tagList);
  }

  lock(name, seconds = 60, ownerId = null) {
    const store = this.store();
    return new CacheLock(store, name, seconds, ownerId);
  }
}

export default CacheManager;
