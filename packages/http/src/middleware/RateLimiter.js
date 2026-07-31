/**
 * Sliding Window & Fixed Window Rate Limiter Engine.
 */
export class RateLimiter {
  constructor() {
    this.hits = new Map();
  }

  /**
   * Register a hit for a key within a given window (in seconds).
   * @param {string} key
   * @param {number} decaySeconds
   * @returns {{ attempts: number, remaining: number, resetAt: number }}
   */
  hit(key, decaySeconds = 60) {
    const now = Date.now();
    const entry = this.hits.get(key) || { count: 0, resetAt: now + decaySeconds * 1000 };

    if (now > entry.resetAt) {
      entry.count = 1;
      entry.resetAt = now + decaySeconds * 1000;
    } else {
      entry.count += 1;
    }

    this.hits.set(key, entry);

    return {
      attempts: entry.count,
      resetAt: Math.ceil(entry.resetAt / 1000)
    };
  }

  tooManyAttempts(key, maxAttempts) {
    const entry = this.hits.get(key);
    if (!entry) return false;
    if (Date.now() > entry.resetAt) return false;
    return entry.count > maxAttempts;
  }

  clear(key) {
    this.hits.delete(key);
  }
}
