import ICacheStore from "../../../contracts/ICacheStore.js";

export default class MemoryCacheStore extends ICacheStore {
    #storage = new Map();
    #tagMap = new Map(); // tag -> Set of keys

    get(key) {
        if (!this.#storage.has(key)) return null;
        const entry = this.#storage.get(key);
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.forget(key);
            return null;
        }
        return entry.value;
    }

    set(key, value, ttlSeconds = null, tags = []) {
        const expiresAt = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
        this.#storage.set(key, { value, expiresAt });

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
        this.#storage.delete(key);
        for (const keysSet of this.#tagMap.values()) {
            keysSet.delete(key);
        }
    }

    flush() {
        this.#storage.clear();
        this.#tagMap.clear();
    }

    flushTags(tags) {
        const tagList = Array.isArray(tags) ? tags : [tags];
        for (const tag of tagList) {
            if (this.#tagMap.has(tag)) {
                const keysSet = this.#tagMap.get(tag);
                for (const key of keysSet) {
                    this.#storage.delete(key);
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
