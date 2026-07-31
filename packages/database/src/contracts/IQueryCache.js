/**
 * Interface IQueryCache
 * API contract for query builder caching and tag invalidation.
 */
export default class IQueryCache {
    get(key) { throw new Error("Method get() must be implemented."); }
    put(key, value, ttlSeconds = null, tags = []) { throw new Error("Method put() must be implemented."); }
    remember(key, ttlSeconds, callback, tags = []) { throw new Error("Method remember() must be implemented."); }
    rememberForever(key, callback, tags = []) { throw new Error("Method rememberForever() must be implemented."); }
    forget(key) { throw new Error("Method forget() must be implemented."); }
    flush() { throw new Error("Method flush() must be implemented."); }
    flushTags(tags) { throw new Error("Method flushTags() must be implemented."); }
}
