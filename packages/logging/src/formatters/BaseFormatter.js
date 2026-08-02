import { ILogFormatter } from '@ecf/contracts';

/**
 * Base Log Formatter.
 */
export class BaseFormatter extends ILogFormatter {
  format(record) {
    return record;
  }
}

export default BaseFormatter;
