export class CacheCollector {
  collectHit(requestRecord, key, driver = 'default') {
    if (!requestRecord) return;
    const at = Date.now() - (requestRecord.startedAt ?? Date.now());
    const timelineItem = { event: `Cache HIT: ${key}`, category: 'cache', at, status: 'SUCCESS', data: { key, driver } };
    if (typeof requestRecord.addTimelineEntry === 'function') requestRecord.addTimelineEntry(timelineItem);
    else if (Array.isArray(requestRecord.timeline)) requestRecord.timeline.push(timelineItem);

    if (typeof requestRecord.addCacheOp === 'function') {
      requestRecord.addCacheOp('hit', { key, driver });
    } else if (requestRecord.panels?.cache) {
      requestRecord.panels.cache.hits = (requestRecord.panels.cache.hits || 0) + 1;
      requestRecord.panels.cache.operations.push({ type: 'hit', key, driver, at });
    }
  }

  collectMiss(requestRecord, key, driver = 'default') {
    if (!requestRecord) return;
    const at = Date.now() - (requestRecord.startedAt ?? Date.now());
    const timelineItem = { event: `Cache MISS: ${key}`, category: 'cache', at, status: 'WARN', data: { key, driver } };
    if (typeof requestRecord.addTimelineEntry === 'function') requestRecord.addTimelineEntry(timelineItem);
    else if (Array.isArray(requestRecord.timeline)) requestRecord.timeline.push(timelineItem);

    if (typeof requestRecord.addCacheOp === 'function') {
      requestRecord.addCacheOp('miss', { key, driver });
    } else if (requestRecord.panels?.cache) {
      requestRecord.panels.cache.misses = (requestRecord.panels.cache.misses || 0) + 1;
      requestRecord.panels.cache.operations.push({ type: 'miss', key, driver, at });
    }
  }

  collectWrite(requestRecord, key, value, ttl = null, driver = 'default') {
    if (!requestRecord) return;
    const at = Date.now() - (requestRecord.startedAt ?? Date.now());
    const timelineItem = { event: `Cache WRITE: ${key}`, category: 'cache', at, status: 'SUCCESS', data: { key, ttl, driver } };
    if (typeof requestRecord.addTimelineEntry === 'function') requestRecord.addTimelineEntry(timelineItem);
    else if (Array.isArray(requestRecord.timeline)) requestRecord.timeline.push(timelineItem);

    if (typeof requestRecord.addCacheOp === 'function') {
      requestRecord.addCacheOp('write', { key, ttl, driver });
    } else if (requestRecord.panels?.cache) {
      requestRecord.panels.cache.writes = (requestRecord.panels.cache.writes || 0) + 1;
      requestRecord.panels.cache.operations.push({ type: 'write', key, ttl, driver, at });
    }
  }

  collectDelete(requestRecord, key, driver = 'default') {
    if (!requestRecord) return;
    const at = Date.now() - (requestRecord.startedAt ?? Date.now());
    const timelineItem = { event: `Cache DELETE: ${key}`, category: 'cache', at, status: 'INFO', data: { key, driver } };
    if (typeof requestRecord.addTimelineEntry === 'function') requestRecord.addTimelineEntry(timelineItem);
    else if (Array.isArray(requestRecord.timeline)) requestRecord.timeline.push(timelineItem);

    if (typeof requestRecord.addCacheOp === 'function') {
      requestRecord.addCacheOp('delete', { key, driver });
    } else if (requestRecord.panels?.cache) {
      requestRecord.panels.cache.deletes = (requestRecord.panels.cache.deletes || 0) + 1;
      requestRecord.panels.cache.operations.push({ type: 'delete', key, driver, at });
    }
  }
}

export default CacheCollector;
