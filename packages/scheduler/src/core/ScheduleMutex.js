/**
 * ScheduleMutex — Cache-based lock mechanism for withoutOverlapping & onOneServer constraints.
 */
export class ScheduleMutex {
  #cache;
  #fallbackLocks = new Map();

  constructor(cache = null) {
    this.#cache = cache;
  }

  getMutexKey(taskName) {
    return `framework/schedule-${Buffer.from(taskName).toString('hex')}`;
  }

  async exists(taskName) {
    const key = this.getMutexKey(taskName);
    if (this.#cache && typeof this.#cache.has === 'function') {
      try {
        return await this.#cache.has(key);
      } catch {
        // Fallback if cache driver fails
      }
    }

    const lock = this.#fallbackLocks.get(key);
    if (!lock) return false;
    if (Date.now() > lock.expiresAt) {
      this.#fallbackLocks.delete(key);
      return false;
    }
    return true;
  }

  async lock(taskName, expiresInMs = 86400000) {
    const key = this.getMutexKey(taskName);
    if (this.#cache && typeof this.#cache.put === 'function') {
      try {
        await this.#cache.put(key, true, Math.ceil(expiresInMs / 1000));
        return true;
      } catch {}
    }

    this.#fallbackLocks.set(key, { expiresAt: Date.now() + expiresInMs });
    return true;
  }

  async unlock(taskName) {
    const key = this.getMutexKey(taskName);
    if (this.#cache && typeof this.#cache.forget === 'function') {
      try {
        await this.#cache.forget(key);
      } catch {}
    }

    this.#fallbackLocks.delete(key);
    return true;
  }

  clear() {
    this.#fallbackLocks.clear();
  }
}

export default ScheduleMutex;
