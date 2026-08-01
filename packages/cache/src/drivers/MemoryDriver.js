import ICacheDriver from "../contracts/ICacheDriver.js";

export class MemoryDriver extends ICacheDriver {
  constructor() {
    super();
    this.store = new Map();
  }

  get(key, defaultValue = null) {
    if (!this.store.has(key)) return defaultValue;
    const item = this.store.get(key);
    if (item.expiresAt !== null && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return defaultValue;
    }
    return item.value;
  }

  put(key, value, ttlSeconds = 0) {
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
    return true;
  }

  has(key) {
    return this.get(key, undefined) !== undefined;
  }

  forget(key) {
    return this.store.delete(key);
  }

  flush() {
    this.store.clear();
    return true;
  }

  increment(key, value = 1) {
    const current = this.get(key, 0);
    const updated = Number(current) + value;
    this.put(key, updated);
    return updated;
  }

  decrement(key, value = 1) {
    return this.increment(key, -value);
  }

  supportsTags() { return true; }
  supportsLocks() { return true; }
  supportsAtomic() { return true; }
}

export default MemoryDriver;
