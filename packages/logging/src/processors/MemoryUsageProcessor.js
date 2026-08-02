import { ILogProcessor } from '@ecf/contracts';

/**
 * Memory Usage Processor.
 * Appends process RSS, heapUsed, heapTotal to log context.
 */
export class MemoryUsageProcessor extends ILogProcessor {
  process(record) {
    if (!record.context) record.context = {};
    const mem = process.memoryUsage();
    record.context.memory = {
      rssMb: Number((mem.rss / (1024 * 1024)).toFixed(2)),
      heapUsedMb: Number((mem.heapUsed / (1024 * 1024)).toFixed(2)),
      heapTotalMb: Number((mem.heapTotal / (1024 * 1024)).toFixed(2)),
    };
    return record;
  }
}

export default MemoryUsageProcessor;
