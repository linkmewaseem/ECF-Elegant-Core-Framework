export default class FragmentCache {
    constructor() {
        this.cache = new Map();
    }

    set(key, content, ttlSeconds = null) {
        if (!key) return;
        const expiresAt = ttlSeconds && typeof ttlSeconds === "number" && ttlSeconds > 0
            ? Date.now() + (ttlSeconds * 1000)
            : null;
        this.cache.set(String(key), { content, expiresAt });
    }

    get(key) {
        if (!key) return null;
        const item = this.cache.get(String(key));
        if (!item) return null;

        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.cache.delete(String(key));
            return null;
        }

        return item.content;
    }

    has(key) {
        return this.get(key) !== null;
    }

    forget(key) {
        return this.cache.delete(String(key));
    }

    clear() {
        this.cache.clear();
        return this;
    }
}
