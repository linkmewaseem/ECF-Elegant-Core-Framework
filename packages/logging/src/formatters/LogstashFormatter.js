import { BaseFormatter } from './BaseFormatter.js';
import { ExceptionFormatter } from './ExceptionFormatter.js';

/**
 * Logstash v1 Schema Formatter.
 */
export class LogstashFormatter extends BaseFormatter {
  constructor({ systemName = 'ecf-app', version = '1' } = {}) {
    super();
    this.systemName = systemName;
    this.version = version;
    this.exceptionFormatter = new ExceptionFormatter();
  }

  format(record) {
    const r = this.exceptionFormatter.format({ ...record });

    const logstashSchema = {
      '@timestamp': r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString(),
      '@version': this.version,
      message: r.message,
      host: r.host || process.env.HOSTNAME || 'localhost',
      type: this.systemName,
      level: String(r.level).toUpperCase(),
      channel: r.channel || 'default',
      context: r.context || {},
      traceId: r.traceId || null,
      correlationId: r.correlationId || null,
    };

    if (r.exception) {
      logstashSchema.exception = r.exception;
    }

    return JSON.stringify(logstashSchema);
  }
}

export default LogstashFormatter;
