import { BaseFormatter } from './BaseFormatter.js';

/**
 * Exception Formatter.
 * Automatically serializes Error objects into structured log objects.
 */
export class ExceptionFormatter extends BaseFormatter {
  format(record) {
    if (!record) return record;

    let exceptionObj = null;

    if (record.message instanceof Error) {
      exceptionObj = this.serializeError(record.message);
      record.message = exceptionObj.message;
    } else if (record.context && record.context.error instanceof Error) {
      exceptionObj = this.serializeError(record.context.error);
      delete record.context.error;
    } else if (record.context && record.context.exception instanceof Error) {
      exceptionObj = this.serializeError(record.context.exception);
      delete record.context.exception;
    }

    if (exceptionObj) {
      record.exception = exceptionObj;
    }

    return record;
  }

  /**
   * Serialize an Error object into JSON-friendly structure.
   * @param {Error} err
   * @returns {Object}
   */
  serializeError(err) {
    if (!err) return null;

    const stackLines = err.stack ? err.stack.split('\n') : [];
    let file = null;
    let line = null;

    if (stackLines.length > 1) {
      const match = stackLines[1].match(/\((.*):(\d+):(\d+)\)/) || stackLines[1].match(/at (.*):(\d+):(\d+)/);
      if (match) {
        file = match[1];
        line = Number(match[2]);
      }
    }

    return {
      name: err.name || 'Error',
      message: err.message || String(err),
      code: err.code || null,
      file,
      line,
      stack: err.stack || null,
      cause: err.cause ? (err.cause instanceof Error ? this.serializeError(err.cause) : err.cause) : null,
      errors: Array.isArray(err.errors) ? err.errors.map((e) => (e instanceof Error ? this.serializeError(e) : e)) : undefined,
    };
  }
}

export default ExceptionFormatter;
