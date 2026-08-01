export class ICacheDriver {
  get(key, defaultValue = null) { throw new Error("Method get() must be implemented."); }
  put(key, value, ttlSeconds = 0) { throw new Error("Method put() must be implemented."); }
  has(key) { throw new Error("Method has() must be implemented."); }
  forget(key) { throw new Error("Method forget() must be implemented."); }
  flush() { throw new Error("Method flush() must be implemented."); }

  supportsTags() { return false; }
  supportsLocks() { return false; }
  supportsAtomic() { return false; }
}

export default ICacheDriver;
