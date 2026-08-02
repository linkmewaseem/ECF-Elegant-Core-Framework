import { BaseFormatter } from './BaseFormatter.js';
import { ExceptionFormatter } from './ExceptionFormatter.js';

/**
 * Standard Single Line Formatter.
 * Output: [timestamp] environment.LEVEL: message {context}
 */
export class LineFormatter extends BaseFormatter {
  constructor({ format = '[%timestamp%] %environment%.%level%: %message% %context%' } = {}) {
    super();
    this.templateFormat = format;
    this.exceptionFormatter = new ExceptionFormatter();
  }

  format(record) {
    const r = this.exceptionFormatter.format({ ...record });
    const timeStr = r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString();
    const envStr = r.environment || 'production';
    const levelStr = String(r.level || 'info').toUpperCase();
    const msgStr = typeof r.message === 'string' ? r.message : JSON.stringify(r.message);
    const ctxStr = r.context && Object.keys(r.context).length > 0 ? JSON.stringify(r.context) : '';

    return this.templateFormat
      .replace('%timestamp%', timeStr)
      .replace('%environment%', envStr)
      .replace('%level%', levelStr)
      .replace('%message%', msgStr)
      .replace('%context%', ctxStr)
      .trim();
  }
}

export default LineFormatter;
