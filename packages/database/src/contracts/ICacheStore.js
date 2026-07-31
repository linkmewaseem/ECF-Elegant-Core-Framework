/**
 * Interface ICacheStore
 * Pluggable cache storage adapter interface.
 */
export default class ICacheStore {
    get(key) { throw new Error("Method get() must be implemented."); }
    set(key, value, ttlSeconds = null) { throw new Error("Method set() must be implemented."); }
    forget(key) { throw new Error("Method forget() must be implemented."); }
    flush() { throw new Error("Method flush() must be implemented."); }
    flushTags(tags) { throw new Error("Method flushTags() must be implemented."); }
    tag(tags) { throw new Error("Method tag() must be implemented."); }
}
