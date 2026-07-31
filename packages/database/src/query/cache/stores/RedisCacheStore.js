import ICacheStore from "../../../contracts/ICacheStore.js";

export default class RedisCacheStore extends ICacheStore {
    #client;
    #memoryFallback = new Map();
    #tagMap = new Map();

    constructor(client = null) {
        super();
        this.#client = client;
    }

    get(key) {
        if (this.#client && typeof this.#client.get === "function") {
            const res = this.#client.get(key);
            return res ? JSON.parse(res) : null;
        }
        const entry = this.#memoryFallback.get(key);
        if (!entry) return null;
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.forget(key);
            return null;
        }
        return entry.value;
    }

    set(key, value, ttlSeconds = null, tags = []) {
        if (this.#client && typeof this.#client.set === "function") {
            const valStr = JSON.stringify(value);
            if (ttlSeconds) {
                this.#client.set(key, valStr, "EX", ttlSeconds);
            } else {
                this.#client.set(key, valStr);
            }
        } else {
            const expiresAt = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
            this.#memoryFallback.set(key, { value, expiresAt });
        }

        if (Array.isArray(tags) && tags.length > 0) {
            for (const tag of tags) {
                if (!this.#tagMap.has(tag)) {
                    this.#tagMap.set(tag, new Set());
                }
                this.#tagMap.get(tag).add(key);
            }
        }
    }

    forget(key) {
        if (this.#client && typeof this.#client.del === "function") {
            this.#client.del(key);
        }
        this.#memoryFallback.delete(key);
        for (const keysSet of this.#tagMap.values()) {
            keysSet.delete(key);
        }
    }

    flush() {
        if (this.#client && typeof this.#client.flushdb === "function") {
            this.#client.flushdb();
        }
        this.#memoryFallback.clear();
        this.#tagMap.clear();
    }

    flushTags(tags) {
        const tagList = Array.isArray(tags) ? tags : [tags];
        for (const tag of tagList) {
            if (this.#tagMap.has(tag)) {
                const keysSet = this.#tagMap.get(tag);
                for (const key of keysSet) {
                    this.forget(key);
                }
                this.#tagMap.delete(tag);
            }
        }
    }

    tag(tags) {
        return {
            set: (key, value, ttlSeconds = null) => this.set(key, value, ttlSeconds, tags),
            get: (key) => this.get(key),
            forget: (key) => this.forget(key),
            flush: () => this.flushTags(tags)
        };
    }
}
