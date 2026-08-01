import { Tracer } from './Tracer.js';

/**
 * Timeline — ordered event log for the current request lifecycle.
 *
 * Each entry records:
 *   event    — named event (e.g. "db.query", "cache.hit", "mail.sent")
 *   category — the panel it belongs to (db, cache, queue, mail, ...)
 *   data     — structured payload
 *   at       — ms since request started
 *   duration — optional duration for this step
 *   status   — ok | warn | slow | critical | error
 *
 * API:
 *   Timeline.record("db.query", { sql, duration: 45 }, "database")
 *   Timeline.getEntries()  → ordered entries for current request
 */
export class Timeline {
  #exporters = [];

  linkExporters(exporters) {
    this.#exporters = exporters;
    return this;
  }

  /**
   * Record a timeline entry for the current request.
   * @param {string} event
   * @param {object} data
   * @param {string} category
   */
  record(event, data = {}, category = "general") {
    const ctx = Tracer.getContext();
    const requestId = ctx?.requestId ?? null;
    const traceId = ctx?.traceId ?? null;
    const startedAt = ctx?.startedAt ?? Date.now();
    const at = Date.now() - startedAt;

    const duration = data.duration ?? data.durationMs ?? null;
    const status = this.#computeStatus(duration);

    const entry = {
      event,
      category,
      data,
      at,
      duration,
      status,
      requestId,
      traceId,
      timestamp: Date.now(),
    };

    for (const exporter of this.#exporters) {
      try { exporter.exportTimelineEntry(entry); } catch {}
    }

    return entry;
  }

  #computeStatus(durationMs) {
    if (durationMs === null) return "ok";
    if (durationMs >= 1000) return "critical";
    if (durationMs >= 500) return "slow";
    if (durationMs >= 100) return "warn";
    return "ok";
  }
}

export default Timeline;
