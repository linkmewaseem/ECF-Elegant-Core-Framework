import { BaseFormatter } from './BaseFormatter.js';
import { ExceptionFormatter } from './ExceptionFormatter.js';

/**
 * Structured JSON Formatter.
 */
export class JsonFormatter extends BaseFormatter {
  constructor({ pretty = false } = {}) {
    super();
    this.pretty = pretty;
    this.exceptionFormatter = new ExceptionFormatter();
  }

  format(record) {
    const formattedRecord = this.exceptionFormatter.format({ ...record });
    return JSON.stringify(formattedRecord, null, this.pretty ? 2 : undefined);
  }
}

export default JsonFormatter;
