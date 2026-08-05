import { RingBuffer } from '@ecfjs/observability';

/**
 * EntryStore — In-memory ring buffer storing up to maxEntries RequestRecords.
 */
export class EntryStore {
  #buffer;

  constructor({ capacity = 200 } = {}) {
    this.#buffer = new RingBuffer(capacity);
  }

  add(record) {
    this.#buffer.push(record.toObject());
    return this;
  }

  all() {
    return this.#buffer.toArray().reverse(); // newest first
  }

  get(id) {
    return this.#buffer.toArray().find((rec) => rec.id === id) ?? null;
  }

  find({ search = null, status = null, method = null, panel = null, limit = 50 } = {}) {
    let entries = this.all();

    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter((e) => e.url.toLowerCase().includes(q) || e.method.toLowerCase().includes(q));
    }

    if (status) {
      entries = entries.filter((e) => e.status === Number(status));
    }

    if (method) {
      entries = entries.filter((e) => e.method.toUpperCase() === method.toUpperCase());
    }

    if (panel) {
      entries = entries.filter((e) => {
        if (panel === 'db') return e.panels.db.totalQueries > 0;
        if (panel === 'cache') return e.panels.cache.hits > 0 || e.panels.cache.misses > 0;
        if (panel === 'queue') return e.panels.queue.totalJobs > 0;
        if (panel === 'mail') return e.panels.mail.totalMails > 0;
        if (panel === 'exceptions') return e.panels.exceptions.length > 0;
        return true;
      });
    }

    return entries.slice(0, limit);
  }

  clear() {
    this.#buffer.clear();
    return this;
  }

  stats() {
    const entries = this.#buffer.toArray();
    const totalRequests = entries.length;
    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        avgDurationMs: 0,
        totalQueries: 0,
        slowQueries: 0,
        totalErrors: 0,
      };
    }

    const totalDuration = entries.reduce((acc, e) => acc + (e.durationMs ?? 0), 0);
    const totalQueries = entries.reduce((acc, e) => acc + (e.panels?.db?.totalQueries ?? 0), 0);
    const slowQueries = entries.reduce((acc, e) => acc + (e.panels?.db?.slowQueries ?? 0), 0);
    const totalErrors = entries.reduce((acc, e) => acc + (e.panels?.exceptions?.length ?? 0), 0);

    return {
      totalRequests,
      avgDurationMs: Math.round(totalDuration / totalRequests),
      totalQueries,
      slowQueries,
      totalErrors,
    };
  }

  get capacity() {
    return this.#buffer.capacity;
  }

  get count() {
    return this.#buffer.size;
  }
}

export default EntryStore;
