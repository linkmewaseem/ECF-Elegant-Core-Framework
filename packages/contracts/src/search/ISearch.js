export class ISearchManager {
  driver(name = null) {}
  extend(name, factory) {}
  use(name) {}
  index(name) {}
  collection(name) {}
  reindex(modelClass) {}
  fake() {}
}

export class ISearchEngine {
  getIndexer() {}
  getQueryEngine() {}
}

export class IIndexer {
  index(indexName, documents) {}
  remove(indexName, documentIds) {}
  flush(indexName) {}
}

export class IQueryEngine {
  search(queryBuilder) {}
}

export class ISearchDriver {
  capabilities() {}
  index(indexName, documents) {}
  search(indexName, params) {}
  remove(indexName, documentIds) {}
  flush(indexName) {}
}

export class ISearchQueryBuilder {
  query(term) {}
  where(field, operator, value) {}
  facet(fields) {}
  aggregate(field, type) {}
  boost(field, weight) {}
  sortBy(field, direction) {}
  take(limit) {}
  get() {}
}

export class ISearchable {
  searchableAs() {}
  toSearchableArray() {}
  shouldBeSearchable() {}
  searchable() {}
  unsearchable() {}
}

export class IDriverCapabilities {
  supports(feature) {}
  getCapabilities() {}
}
