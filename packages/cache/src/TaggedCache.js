import { Arr } from "@ecf/support";

export class TaggedCache {
  constructor(store, tags = []) {
    this.store = store;
    this.tags = Arr.wrap(tags);
  }

  getNamespace() {
    return this.tags.sort().join(":");
  }

  getKey(key) {
    return `tag:${this.getNamespace()}:${key}`;
  }

  get(key, defaultValue = null) {
    return this.store.get(this.getKey(key), defaultValue);
  }

  put(key, value, ttlSeconds = 0) {
    // Record key in tag index
    const tagIndexKey = `tag_index:${this.getNamespace()}`;
    const keys = this.store.get(tagIndexKey, []);
    const fullKey = this.getKey(key);
    if (!keys.includes(fullKey)) {
      keys.push(fullKey);
      this.store.put(tagIndexKey, keys);
    }
    return this.store.put(fullKey, value, ttlSeconds);
  }

  flush() {
    const tagIndexKey = `tag_index:${this.getNamespace()}`;
    const keys = this.store.get(tagIndexKey, []);
    for (const fullKey of keys) {
      this.store.forget(fullKey);
    }
    this.store.forget(tagIndexKey);
    return true;
  }
}

export default TaggedCache;
