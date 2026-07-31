export class ListenerRegistry {
  constructor() {
    this.listeners = new Map();
    this.compiledCache = new Map();
  }

  listen(eventName, listener, priority = 0) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push({ listener, priority });
    this.compiledCache.delete(eventName);
    this.compiledCache.clear(); // Clear wildcard caches
  }

  forget(eventName) {
    this.listeners.delete(eventName);
    this.compiledCache.clear();
  }

  getListeners(eventName) {
    if (this.compiledCache.has(eventName)) {
      return this.compiledCache.get(eventName);
    }

    const matched = [];

    for (const [pattern, list] of this.listeners.entries()) {
      if (pattern === "*" || pattern === eventName || this.matchWildcard(pattern, eventName)) {
        matched.push(...list);
      }
    }

    // Sort by priority descending
    matched.sort((a, b) => b.priority - a.priority);
    const sortedListeners = matched.map((item) => item.listener);

    this.compiledCache.set(eventName, sortedListeners);
    return sortedListeners;
  }

  matchWildcard(pattern, eventName) {
    if (!pattern.includes("*")) return false;
    const regexStr = "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$";
    const regex = new RegExp(regexStr);
    return regex.test(eventName);
  }
}

export default ListenerRegistry;
