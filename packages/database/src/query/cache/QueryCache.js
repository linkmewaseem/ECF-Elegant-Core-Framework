import IQueryCache from "../../contracts/IQueryCache.js";
import MemoryCacheStore from "./stores/MemoryCacheStore.js";
import RedisCacheStore from "./stores/RedisCacheStore.js";
import FileCacheStore from "./stores/FileCacheStore.js";
import CustomCacheStore from "./stores/CustomCacheStore.js";

export default class QueryCache extends IQueryCache {
    #stores = new Map();
    #defaultStoreName = "memory";
    #metrics = null;

    constructor(defaultStore = "memory", metrics = null) {
        super();
        this.#metrics = metrics;
        this.#stores.set("memory", new MemoryCacheStore());
        this.#stores.set("redis", new RedisCacheStore());
        this.#stores.set("file", new FileCacheStore());
        this.#defaultStoreName = defaultStore;
    }

    setMetrics(metrics) {
        this.#metrics = metrics;
    }

    registerStore(name, storeInstance) {
        this.#stores.set(name, storeInstance);
        return this;
    }

    store(name = null) {
        const storeName = name || this.#defaultStoreName;
        if (!this.#stores.has(storeName)) {
            if (storeName === "custom") {
                const newStore = new CustomCacheStore();
                this.#stores.set("custom", newStore);
                return newStore;
            }
            throw new Error(`Cache store [${storeName}] is not registered.`);
        }
        return this.#stores.get(storeName);
    }

    generateKey(sql, bindings = []) {
        const payload = JSON.stringify({ sql, bindings });
        let hash = 0;
        for (let i = 0; i < payload.length; i++) {
            hash = ((hash << 5) - hash) + payload.charCodeAt(i);
            hash |= 0;
        }
        return `qc_${Math.abs(hash).toString(36)}`;
    }

    get(key, storeName = null) {
        const val = this.store(storeName).get(key);
        if (this.#metrics) {
            if (val !== null && val !== undefined) {
                this.#metrics.increment("Cache", "hits");
            } else {
                this.#metrics.increment("Cache", "misses");
            }
        }
        return val;
    }

    put(key, value, ttlSeconds = null, tags = [], storeName = null) {
        this.store(storeName).set(key, value, ttlSeconds, tags);
    }

    async remember(key, ttlSeconds, callback, tags = [], storeName = null) {
        const cached = this.get(key, storeName);
        if (cached !== null && cached !== undefined) {
            return cached;
        }

        const freshValue = await callback();
        this.put(key, freshValue, ttlSeconds, tags, storeName);
        return freshValue;
    }

    async rememberForever(key, callback, tags = [], storeName = null) {
        return this.remember(key, null, callback, tags, storeName);
    }

    forget(key, storeName = null) {
        this.store(storeName).forget(key);
    }

    flush(storeName = null) {
        this.store(storeName).flush();
    }

    flushTags(tags, storeName = null) {
        this.store(storeName).flushTags(tags);
    }
}
