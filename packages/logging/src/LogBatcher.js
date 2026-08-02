/**
 * Fluent Log Batcher builder.
 * Allows bundling multiple log records into a single flush write.
 */
export class LogBatcher {
  constructor(channel) {
    this.channel = channel;
    this.batchRecords = [];
  }

  add(level, message, context = {}) {
    this.batchRecords.push({ level, message, context, timestamp: Date.now() });
    return this;
  }

  async flush() {
    if (this.batchRecords.length === 0) return [];
    const records = [...this.batchRecords];
    this.batchRecords = [];

    const results = [];
    for (const item of records) {
      const res = await this.channel.log(item.level, item.message, item.context);
      results.push(res);
    }
    return results;
  }
}

export default LogBatcher;
