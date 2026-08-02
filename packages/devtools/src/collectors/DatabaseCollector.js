export class DatabaseCollector {
  collectQuery(requestRecord, queryData) {
    if (!requestRecord) return;
    requestRecord.addQuery({
      sql: queryData.sql ?? 'SELECT 1',
      bindings: queryData.bindings ?? [],
      durationMs: queryData.durationMs ?? queryData.duration ?? 0,
      connection: queryData.connection ?? 'default',
      rowsCount: queryData.rowsCount ?? null,
      at: Date.now() - requestRecord.startedAt,
    });
  }
}

export default DatabaseCollector;
