export class StorageCollector {
  collectOperation(requestRecord, operation, path, disk = 'local', durationMs = 0) {
    if (requestRecord) {
      requestRecord.addStorageOp({
        operation,
        path,
        disk,
        durationMs,
        at: Date.now() - requestRecord.startedAt,
      });
    }
  }
}

export default StorageCollector;
