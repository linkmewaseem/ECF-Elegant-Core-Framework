import { BaseHook } from './BaseHook.js';

export class DatabaseHook extends BaseHook {
  onQueryExecuting(payload) {
    const span = this.startSpan(`db.query: ${payload.sql?.slice(0, 40) ?? "SQL"}`, "db", {
      sql: payload.sql,
      bindings: payload.bindings,
      connection: payload.connection ?? "default",
    });
    return span;
  }

  onQueryExecuted(span, payload) {
    this.recordMetric("histogram", "db.query_time_ms", payload.durationMs ?? 0, { connection: payload.connection });
    this.recordMetric("counter", "db.queries_total", 1);
    this.recordTimeline("QueryExecuted", {
      sql: payload.sql,
      duration: payload.durationMs,
      connection: payload.connection,
      rows: payload.rowsCount ?? null,
    }, "db");
    this.finishSpan(span, {
      durationMs: payload.durationMs,
      rowsCount: payload.rowsCount,
    });
  }

  onQueryFailed(span, payload) {
    if (span && typeof span.recordError === "function") {
      span.recordError(payload.error ?? new Error(payload.message ?? "Query failed"));
    }
    this.recordMetric("counter", "db.queries_failed", 1);
    this.recordTimeline("QueryFailed", {
      sql: payload.sql,
      error: payload.error?.message,
      connection: payload.connection,
    }, "db");
    this.finishSpan(span);
  }
}

export class CacheHook extends BaseHook {
  onHit(key, driver = "default") {
    this.recordMetric("counter", "cache.hits", 1, { driver });
    this.recordTimeline("CacheHit", { key, driver }, "cache");
  }

  onMiss(key, driver = "default") {
    this.recordMetric("counter", "cache.misses", 1, { driver });
    this.recordTimeline("CacheMiss", { key, driver }, "cache");
  }

  onWritten(key, value, ttl = null, driver = "default") {
    this.recordMetric("counter", "cache.writes", 1, { driver });
    this.recordTimeline("CacheWritten", { key, ttl, driver }, "cache");
  }

  onForgotten(key, driver = "default") {
    this.recordMetric("counter", "cache.deletes", 1, { driver });
    this.recordTimeline("CacheForgotten", { key, driver }, "cache");
  }
}

export class QueueHook extends BaseHook {
  onJobDispatched(jobName, queue = "default", payload = {}) {
    this.recordMetric("counter", "queue.dispatched", 1, { queue });
    this.recordTimeline("JobDispatched", { jobName, queue, payload }, "queue");
  }

  onJobProcessing(jobName, queue = "default") {
    return this.startSpan(`queue.job: ${jobName}`, "queue", { jobName, queue });
  }

  onJobProcessed(span, jobName, durationMs, queue = "default") {
    this.recordMetric("counter", "queue.processed", 1, { queue });
    this.recordMetric("histogram", "queue.job_duration_ms", durationMs, { queue });
    this.recordTimeline("JobProcessed", { jobName, queue, duration: durationMs }, "queue");
    this.finishSpan(span, { durationMs });
  }

  onJobFailed(span, jobName, error, queue = "default") {
    if (span && typeof span.recordError === "function") {
      span.recordError(error);
    }
    this.recordMetric("counter", "queue.failed", 1, { queue });
    this.recordTimeline("JobFailed", { jobName, queue, error: error?.message }, "queue");
    this.finishSpan(span);
  }
}

export class MailHook extends BaseHook {
  onMailSending(mailable) {
    return this.startSpan(`mail.send: ${mailable.subject ?? "Mailable"}`, "mail", {
      to: mailable.to,
      subject: mailable.subject,
    });
  }

  onMailSent(span, mailable, durationMs) {
    this.recordMetric("counter", "mail.sent", 1);
    this.recordTimeline("MailSent", {
      to: mailable.to,
      subject: mailable.subject,
      duration: durationMs,
    }, "mail");
    this.finishSpan(span, { durationMs });
  }

  onMailFailed(span, mailable, error) {
    if (span && typeof span.recordError === "function") {
      span.recordError(error);
    }
    this.recordMetric("counter", "mail.failed", 1);
    this.recordTimeline("MailFailed", {
      to: mailable.to,
      error: error?.message,
    }, "mail");
    this.finishSpan(span);
  }
}

export class NotificationHook extends BaseHook {
  onNotificationSending(notification, channel) {
    return this.startSpan(`notification.send: ${notification.constructor.name} via ${channel}`, "notifications", {
      channel,
      notification: notification.constructor.name,
    });
  }

  onNotificationSent(span, notification, channel, durationMs) {
    this.recordMetric("counter", "notifications.sent", 1, { channel });
    this.recordTimeline("NotificationSent", {
      notification: notification.constructor.name,
      channel,
      duration: durationMs,
    }, "notifications");
    this.finishSpan(span, { durationMs });
  }
}

export class UploadHook extends BaseHook {
  onFileUploaded(fileInfo) {
    this.recordMetric("counter", "upload.files_total", 1);
    this.recordMetric("histogram", "upload.file_size_bytes", fileInfo.size ?? 0);
    this.recordTimeline("FileUploaded", {
      name: fileInfo.name,
      mimeType: fileInfo.mimeType,
      size: fileInfo.size,
      hash: fileInfo.hash,
    }, "upload");
  }
}

export class StorageHook extends BaseHook {
  onOperation(operation, path, disk, durationMs = 0) {
    this.recordMetric("counter", `storage.${operation}`, 1, { disk });
    this.recordTimeline("StorageOperation", {
      operation,
      path,
      disk,
      duration: durationMs,
    }, "storage");
  }
}

export class MediaHook extends BaseHook {
  onMediaProcessing(mediaFile, driver = "sharp") {
    return this.startSpan(`media.process: ${mediaFile.getOriginalName?.() ?? "file"}`, "media", {
      mimeType: mediaFile.getMimeType?.(),
      driver,
    });
  }

  onMediaProcessed(span, result) {
    this.recordMetric("counter", "media.processed_total", 1);
    this.recordTimeline("MediaProcessed", {
      originalName: result.originalName,
      variantsCount: Object.keys(result.variants ?? {}).length,
      storedPath: result.storedPath,
    }, "media");
    this.finishSpan(span);
  }
}

export class AuthHook extends BaseHook {
  onLogin(user, guard = "web") {
    this.recordMetric("counter", "auth.logins", 1, { guard });
    this.recordTimeline("UserLogin", { userId: user.id ?? user.uuid ?? "unknown", guard }, "auth");
  }

  onFailedLogin(credentials, guard = "web") {
    this.recordMetric("counter", "auth.failed_logins", 1, { guard });
    this.recordTimeline("FailedLogin", { email: credentials.email ?? "unknown", guard }, "auth");
  }

  onLogout(user, guard = "web") {
    this.recordMetric("counter", "auth.logouts", 1, { guard });
    this.recordTimeline("UserLogout", { userId: user?.id ?? "unknown", guard }, "auth");
  }
}

export class HttpHook extends BaseHook {
  onRequestStarted(request) {
    return this.startSpan(`http.${request.method ?? "GET"} ${request.url ?? "/"}`, "http", {
      method: request.method,
      url: request.url,
      ip: request.ip,
    });
  }

  onRequestFinished(span, response, durationMs) {
    const status = response.statusCode ?? response.status ?? 200;
    this.recordMetric("counter", "http.requests_total", 1, { status });
    this.recordMetric("histogram", "http.response_time_ms", durationMs);
    this.recordTimeline("RequestFinished", {
      status,
      duration: durationMs,
    }, "http");
    this.finishSpan(span, { status, durationMs });
  }
}
