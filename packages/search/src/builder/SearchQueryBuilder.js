import SearchResult from "../results/SearchResult.js";

export class SearchQueryBuilder {
  constructor(indexName, searchEngine, cacheManager = null, suggestionsEngine = null) {
    this.indexName = indexName;
    this.searchEngine = searchEngine;
    this.cacheManager = cacheManager;
    this.suggestionsEngine = suggestionsEngine;

    this.searchTerm = "";
    this.filters = [];
    this.facetsSpecs = [];
    this.aggregationsSpecs = [];
    this.boostsSpecs = {};
    this.sortSpecs = null;
    this.limitValue = 20;
    this.offsetValue = 0;
    this.highlightSpecs = [];
    this.synonymsSpecs = {};
    this.cacheTtl = 0;
    this.dslSpec = null;
  }

  query(term) {
    this.searchTerm = term;
    if (this.suggestionsEngine && term) {
      this.suggestionsEngine.recordQuery(term);
    }
    return this;
  }

  dsl(dslObj) {
    this.dslSpec = dslObj;
    return this;
  }

  where(field, opOrVal, val = undefined) {
    let op = "=";
    let value = opOrVal;
    if (val !== undefined) {
      op = opOrVal;
      value = val;
    }
    this.filters.push({ field, op, value });
    return this;
  }

  whereIn(field, values) {
    this.filters.push({ field, op: "in", value: values });
    return this;
  }

  whereRange(field, min, max) {
    if (min !== undefined) this.filters.push({ field, op: ">=", value: min });
    if (max !== undefined) this.filters.push({ field, op: "<=", value: max });
    return this;
  }

  facet(fields) {
    const list = Array.isArray(fields) ? fields : [fields];
    this.facetsSpecs.push(...list);
    return this;
  }

  aggregate(field, type = "avg") {
    this.aggregationsSpecs.push({ field, type });
    return this;
  }

  boost(field, weight) {
    this.boostsSpecs[field] = weight;
    return this;
  }

  sortBy(field, direction = "asc") {
    this.sortSpecs = { field, direction };
    return this;
  }

  take(limit) {
    this.limitValue = limit;
    return this;
  }

  skip(offset) {
    this.offsetValue = offset;
    return this;
  }

  highlight(fields) {
    const list = Array.isArray(fields) ? fields : [fields];
    this.highlightSpecs.push(...list);
    return this;
  }

  synonyms(synonymMap) {
    this.synonymsSpecs = synonymMap;
    return this;
  }

  withCache(ttlInSeconds = 300) {
    this.cacheTtl = ttlInSeconds;
    return this;
  }

  async get() {
    const startTime = Date.now();
    const cacheKey = `search:${JSON.stringify(this.indexName)}:${this.searchTerm}:${JSON.stringify(this.filters)}:${this.limitValue}:${this.offsetValue}`;

    if (this.cacheTtl > 0 && this.cacheManager) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return new SearchResult({ ...cached, durationMs: Date.now() - startTime });
      }
    }

    const queryEngine = this.searchEngine.getQueryEngine();
    const rawResult = await queryEngine.execute(this);
    const durationMs = Date.now() - startTime;

    const result = new SearchResult({
      hits: rawResult.hits || [],
      total: rawResult.total || 0,
      facets: rawResult.facets || {},
      aggregations: rawResult.aggregations || {},
      offset: this.offsetValue,
      limit: this.limitValue,
      durationMs,
      driver: rawResult.driver || "memory",
    });

    if (this.cacheTtl > 0 && this.cacheManager) {
      await this.cacheManager.put(cacheKey, result, this.cacheTtl, [String(this.indexName)]);
    }

    return result;
  }

  async paginate(page = 1, perPage = 20) {
    this.limitValue = perPage;
    this.offsetValue = (page - 1) * perPage;
    const res = await this.get();
    return {
      data: res.hits,
      total: res.total,
      perPage,
      currentPage: page,
      lastPage: Math.ceil(res.total / perPage) || 1,
    };
  }

  suggest(limit = 5) {
    if (!this.suggestionsEngine) return [];
    return this.suggestionsEngine.suggest(this.searchTerm, limit);
  }
}

export default SearchQueryBuilder;
