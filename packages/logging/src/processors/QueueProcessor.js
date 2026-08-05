import { ILogProcessor } from '@ecfjs/contracts';

/**
 * Queue Job Context Processor.
 */
export class QueueProcessor extends ILogProcessor {
  constructor({ jobGetter = null } = {}) {
    super();
    this.jobGetter = jobGetter;
  }

  process(record) {
    let job = null;
    if (typeof this.jobGetter === 'function') {
      job = this.jobGetter();
    }

    if (job) {
      if (!record.context) record.context = {};
      record.context.queueJob = {
        id: job.id || null,
        name: job.name || job.constructor?.name || 'UnknownJob',
        queue: job.queue || 'default',
        attempts: job.attempts || 1,
      };
    }

    return record;
  }
}

export default QueueProcessor;
