/**
 * DevTools Log Collector.
 * Collects log records for DevTools requests and panel display.
 */
export class LogCollector {
  constructor() {
    this.logs = [];
    this.stats = {
      totalLogs: 0,
      errors: 0,
      warnings: 0,
      failedWrites: 0,
      channels: {},
    };
  }

  collectLog(requestRecord, logEntry) {
    const item = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: logEntry.timestamp || Date.now(),
      level: logEntry.level || 'info',
      message: typeof logEntry.message === 'string' ? logEntry.message : JSON.stringify(logEntry.message),
      channel: logEntry.channel || 'default',
      context: logEntry.context || {},
      traceId: logEntry.traceId || null,
      correlationId: logEntry.correlationId || null,
      exception: logEntry.exception || null,
    };

    this.logs.push(item);
    this.stats.totalLogs++;

    const levelStr = String(item.level).toLowerCase();
    if (['error', 'critical', 'alert', 'emergency'].includes(levelStr)) {
      this.stats.errors++;
    } else if (levelStr === 'warning') {
      this.stats.warnings++;
    }

    this.stats.channels[item.channel] = (this.stats.channels[item.channel] || 0) + 1;

    if (requestRecord && typeof requestRecord.addJob === 'function') {
      requestRecord.addJob('log', item);
    }
  }

  recordFailedWrite(channelName, error) {
    this.stats.failedWrites++;
  }

  getSummary() {
    return {
      totalLogs: this.stats.totalLogs,
      errors: this.stats.errors,
      warnings: this.stats.warnings,
      failedWrites: this.stats.failedWrites,
      channels: { ...this.stats.channels },
      recentLogs: this.logs.slice(-100),
    };
  }

  clear() {
    this.logs = [];
    this.stats = {
      totalLogs: 0,
      errors: 0,
      warnings: 0,
      failedWrites: 0,
      channels: {},
    };
  }
}

export default LogCollector;
