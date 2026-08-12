export class DatabaseCollector {
  collectQuery(requestRecord, queryData) {
    if (!requestRecord) return;

    const queryObj = {
      sql: queryData.sql ?? 'SELECT 1',
      bindings: queryData.bindings ?? [],
      durationMs: queryData.durationMs ?? queryData.duration ?? 0,
      connection: queryData.connection ?? 'default',
      rowsCount: queryData.rowsCount ?? null,
      at: Date.now() - (requestRecord.startedAt ?? Date.now()),
    };

    const timelineItem = {
      event: `SQL: ${queryObj.sql.substring(0, 50)}`,
      category: 'db',
      at: queryObj.at,
      status: queryObj.durationMs >= 100 ? 'WARN' : 'SUCCESS',
      data: { sql: queryObj.sql, durationMs: queryObj.durationMs, connection: queryObj.connection }
    };

    if (typeof requestRecord.addTimelineEntry === 'function') {
      requestRecord.addTimelineEntry(timelineItem);
    } else if (Array.isArray(requestRecord.timeline)) {
      requestRecord.timeline.push(timelineItem);
    }

    if (typeof requestRecord.addQuery === 'function') {
      requestRecord.addQuery(queryObj);
      return;
    }

    const dbPanel = requestRecord.panels?.db;
    if (dbPanel) {
      dbPanel.queries = dbPanel.queries || [];
      const existingIndex = dbPanel.queries.findIndex(q => q.sql === queryObj.sql);
      if (existingIndex !== -1) {
        dbPanel.duplicateQueries = (dbPanel.duplicateQueries || 0) + 1;
      }
      if (queryObj.durationMs >= 100) {
        dbPanel.slowQueries = (dbPanel.slowQueries || 0) + 1;
      }
      dbPanel.queries.push(queryObj);
      dbPanel.totalQueries = (dbPanel.totalQueries || 0) + 1;
      dbPanel.totalDurationMs = (dbPanel.totalDurationMs || 0) + queryObj.durationMs;
    }
  }
}

export default DatabaseCollector;
