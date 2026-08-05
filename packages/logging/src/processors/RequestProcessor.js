import { ILogProcessor } from '@ecfjs/contracts';

/**
 * HTTP Request Context Processor.
 */
export class RequestProcessor extends ILogProcessor {
  constructor({ requestGetter = null } = {}) {
    super();
    this.requestGetter = requestGetter;
  }

  process(record) {
    let req = null;
    if (typeof this.requestGetter === 'function') {
      req = this.requestGetter();
    }

    if (req) {
      if (!record.context) record.context = {};
      record.context.request = {
        method: req.method || 'GET',
        url: req.url || '/',
        ip: req.ip || req.headers?.['x-forwarded-for'] || null,
        userAgent: req.headers?.['user-agent'] || null,
      };
    }

    return record;
  }
}

export default RequestProcessor;
