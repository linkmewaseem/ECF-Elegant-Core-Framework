/**
 * Log Lifecycle Events.
 */
export class LogWriting {
  constructor(record) {
    this.record = record;
  }
}

export class LogWritten {
  constructor(record, channelName) {
    this.record = record;
    this.channelName = channelName;
  }
}

export class LogFailed {
  constructor(record, error, channelName) {
    this.record = record;
    this.error = error;
    this.channelName = channelName;
  }
}

export class LogDropped {
  constructor(record, reason) {
    this.record = record;
    this.reason = reason;
  }
}

export class LogRotated {
  constructor(oldPath, newPath, channelName) {
    this.oldPath = oldPath;
    this.newPath = newPath;
    this.channelName = channelName;
  }
}

export class LogFlushed {
  constructor(count, channelName) {
    this.count = count;
    this.channelName = channelName;
  }
}
