import os from 'node:os';
import { ILogProcessor } from '@ecfjs/contracts';

/**
 * Hostname & PID Processor.
 */
export class HostnameProcessor extends ILogProcessor {
  constructor() {
    super();
    this.hostname = os.hostname();
    this.pid = process.pid;
  }

  process(record) {
    if (!record.context) record.context = {};
    record.context.hostname = this.hostname;
    record.context.pid = this.pid;
    return record;
  }
}

export default HostnameProcessor;
