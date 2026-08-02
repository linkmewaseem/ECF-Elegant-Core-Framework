import { randomUUID } from 'node:crypto';

/**
 * RequestRecord — Per-request diagnostic snapshot containing all panel metrics.
 */
export class RequestRecord {
  constructor({
    id = randomUUID(),
    traceId = null,
    method = 'GET',
    url = '/',
    ip = '127.0.0.1',
    startedAt = Date.now(),
  } = {}) {
    this.id = id;
    this.traceId = traceId ?? id;
    this.method = method;
    this.url = url;
    this.ip = ip;
    this.startedAt = startedAt;
    this.endedAt = null;
    this.durationMs = 0;
    this.status = 200;

    this.panels = {
      http: { method, url, status: 200, headers: {}, params: {}, query: {}, ip, durationMs: 0 },
      db: { queries: [], totalQueries: 0, slowQueries: 0, duplicateQueries: 0, totalDurationMs: 0 },
      cache: { hits: 0, misses: 0, writes: 0, deletes: 0, operations: [] },
      queue: { dispatched: [], processed: [], failed: [], totalJobs: 0 },
      mail: { sent: [], failed: [], totalMails: 0 },
      notifications: { sent: [], channels: {} },
      events: { dispatched: [], totalEvents: 0 },
      storage: { operations: [], totalOps: 0 },
      upload: { files: [], totalBytes: 0 },
      media: { processed: [], totalFiles: 0 },
      exceptions: [],
      performance: { memoryBefore: null, memoryAfter: null, memoryDelta: null, cpuTime: 0, peakMemory: 0 },
    };

    this.timeline = [];
    this.tags = {};
  }

  addQuery(queryData) {
    const existingIndex = this.panels.db.queries.findIndex((q) => q.sql === queryData.sql);
    if (existingIndex !== -1) {
      this.panels.db.duplicateQueries++;
    }

    if (queryData.durationMs >= 100) {
      this.panels.db.slowQueries++;
    }

    this.panels.db.queries.push(queryData);
    this.panels.db.totalQueries++;
    this.panels.db.totalDurationMs += queryData.durationMs ?? 0;
  }

  addCacheOp(opType, data) {
    if (opType === 'hit') this.panels.cache.hits++;
    else if (opType === 'miss') this.panels.cache.misses++;
    else if (opType === 'write') this.panels.cache.writes++;
    else if (opType === 'delete') this.panels.cache.deletes++;

    this.panels.cache.operations.push({ type: opType, ...data, at: Date.now() - this.startedAt });
  }

  addJob(status, jobData) {
    if (status === 'dispatched') this.panels.queue.dispatched.push(jobData);
    else if (status === 'processed') this.panels.queue.processed.push(jobData);
    else if (status === 'failed') this.panels.queue.failed.push(jobData);

    this.panels.queue.totalJobs++;
  }

  addMail(status, mailData) {
    if (status === 'sent') this.panels.mail.sent.push(mailData);
    else if (status === 'failed') this.panels.mail.failed.push(mailData);

    this.panels.mail.totalMails++;
  }

  addNotification(notificationData) {
    this.panels.notifications.sent.push(notificationData);
    const ch = notificationData.channel ?? 'default';
    this.panels.notifications.channels[ch] = (this.panels.notifications.channels[ch] ?? 0) + 1;
  }

  addEvent(eventData) {
    this.panels.events.dispatched.push(eventData);
    this.panels.events.totalEvents++;
  }

  addStorageOp(opData) {
    this.panels.storage.operations.push(opData);
    this.panels.storage.totalOps++;
  }

  addUpload(fileData) {
    this.panels.upload.files.push(fileData);
    this.panels.upload.totalBytes += fileData.size ?? 0;
  }

  addMedia(mediaData) {
    this.panels.media.processed.push(mediaData);
    this.panels.media.totalFiles++;
  }

  addException(error) {
    this.panels.exceptions.push({
      name: error.name ?? 'Error',
      message: error.message,
      stack: error.stack,
      at: Date.now() - this.startedAt,
    });
    if (this.status === 200) this.status = 500;
  }

  addTimelineEntry(entry) {
    this.timeline.push(entry);
  }

  seal({ status = 200, memoryBefore = null, memoryAfter = null } = {}) {
    this.endedAt = Date.now();
    this.durationMs = this.endedAt - this.startedAt;
    this.status = status;
    this.panels.http.status = status;
    this.panels.http.durationMs = this.durationMs;

    if (memoryBefore && memoryAfter) {
      this.panels.performance.memoryBefore = memoryBefore;
      this.panels.performance.memoryAfter = memoryAfter;
      this.panels.performance.memoryDelta = {
        rss: memoryAfter.rss - memoryBefore.rss,
        heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
      };
      this.panels.performance.peakMemory = memoryAfter.heapUsed;
    }

    return this;
  }

  toObject() {
    return {
      id: this.id,
      traceId: this.traceId,
      method: this.method,
      url: this.url,
      ip: this.ip,
      status: this.status,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      durationMs: this.durationMs,
      panels: this.panels,
      timeline: this.timeline,
      tags: this.tags,
    };
  }
}

export default RequestRecord;
