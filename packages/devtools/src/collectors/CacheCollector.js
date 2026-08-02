export class CacheCollector {
  collectHit(requestRecord, key, driver = 'default') {
    if (requestRecord) requestRecord.addCacheOp('hit', { key, driver });
  }

  collectMiss(requestRecord, key, driver = 'default') {
    if (requestRecord) requestRecord.addCacheOp('miss', { key, driver });
  }

  collectWrite(requestRecord, key, value, ttl = null, driver = 'default') {
    if (requestRecord) requestRecord.addCacheOp('write', { key, ttl, driver });
  }

  collectDelete(requestRecord, key, driver = 'default') {
    if (requestRecord) requestRecord.addCacheOp('delete', { key, driver });
  }
}

export default CacheCollector;
