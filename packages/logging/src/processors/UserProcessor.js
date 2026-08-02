import { ILogProcessor } from '@ecf/contracts';

/**
 * User Context Processor.
 */
export class UserProcessor extends ILogProcessor {
  constructor({ userGetter = null } = {}) {
    super();
    this.userGetter = userGetter;
  }

  process(record) {
    let user = null;
    if (typeof this.userGetter === 'function') {
      user = this.userGetter();
    }

    if (user) {
      if (!record.context) record.context = {};
      record.context.user = {
        id: user.id || user.userId || null,
        email: user.email || null,
        role: user.role || null,
      };
    }

    return record;
  }
}

export default UserProcessor;
