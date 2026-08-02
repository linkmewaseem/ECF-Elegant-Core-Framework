import { BaseFormatter } from './BaseFormatter.js';
import { ExceptionFormatter } from './ExceptionFormatter.js';

/**
 * Web / Browser Console Formatter.
 */
export class ConsoleFormatter extends BaseFormatter {
  constructor() {
    super();
    this.exceptionFormatter = new ExceptionFormatter();
  }

  format(record) {
    const r = this.exceptionFormatter.format({ ...record });
    const timeStr = r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString();
    return `[${timeStr}] ${String(r.level).toUpperCase()}: ${r.message} ${JSON.stringify(r.context || {})}`;
  }
}

export default ConsoleFormatter;
