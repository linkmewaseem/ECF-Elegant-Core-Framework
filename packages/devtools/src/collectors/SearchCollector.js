export class SearchCollector {
  constructor() {
    this.queries = [];
    this.stats = {
      totalQueries: 0,
      totalHits: 0,
      cacheHits: 0,
      totalDurationMs: 0,
    };
  }

  collectSearch(requestRecord, indexName, params, result, durationMs = 0) {
    const isCacheHit = Boolean(result.fromCache);
    const item = {
      id: `search_${Date.now()}_${Math.random()}`,
      indexName,
      term: params.term || "",
      driver: result.driver || "memory",
      hitsCount: result.hits?.length || 0,
      total: result.total || 0,
      durationMs,
      fromCache: isCacheHit,
      filters: params.filters || [],
      at: Date.now() - (requestRecord?.startedAt || Date.now()),
      timestamp: Date.now(),
    };

    this.queries.push(item);
    this.stats.totalQueries++;
    this.stats.totalHits += item.hitsCount;
    this.stats.totalDurationMs += durationMs;
    if (isCacheHit) this.stats.cacheHits++;

    if (requestRecord && typeof requestRecord.addJob === "function") {
      requestRecord.addJob("search", item);
    }
  }

  getSummary() {
    return {
      totalQueries: this.stats.totalQueries,
      totalHits: this.stats.totalHits,
      cacheHits: this.stats.cacheHits,
      avgDurationMs: this.stats.totalQueries > 0 ? (this.stats.totalDurationMs / this.stats.totalQueries).toFixed(2) : 0,
      recentQueries: this.queries.slice(-50),
    };
  }
}

export default SearchCollector;
