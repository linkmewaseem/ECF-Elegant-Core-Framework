export class SearchResult {
  constructor({
    hits = [],
    total = 0,
    facets = {},
    aggregations = {},
    offset = 0,
    limit = 20,
    durationMs = 0,
    driver = "memory",
  } = {}) {
    this.hits = hits;
    this.total = total;
    this.facets = facets;
    this.aggregations = aggregations;
    this.offset = offset;
    this.limit = limit;
    this.durationMs = durationMs;
    this.driver = driver;
  }

  getHits() {
    return this.hits;
  }

  getTotal() {
    return this.total;
  }

  getFacets() {
    return this.facets;
  }

  getAggregations() {
    return this.aggregations;
  }
}

export default SearchResult;
