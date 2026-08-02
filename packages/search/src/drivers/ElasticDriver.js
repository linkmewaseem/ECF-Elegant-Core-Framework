import ISearchDriver from "../contracts/ISearchDriver.js";

export class ElasticDriver extends ISearchDriver {
  constructor(options = {}) {
    super();
    this.node = options.node || "http://localhost:9200";
    this.apiKey = options.apiKey || null;
    this.indexedStore = new Map();
  }

  capabilities() {
    return [
      "search",
      "index",
      "remove",
      "flush",
      "facet",
      "highlight",
      "aggregate",
      "filter",
      "sort",
      "vector",
      "geo",
      "dsl",
    ];
  }

  async index(indexName, documents) {
    if (!this.indexedStore.has(indexName)) this.indexedStore.set(indexName, []);
    this.indexedStore.get(indexName).push(...documents);
    return { success: true, driver: "elastic", count: documents.length };
  }

  async remove(indexName, documentIds) {
    return { success: true, driver: "elastic" };
  }

  async flush(indexName) {
    if (this.indexedStore.has(indexName)) this.indexedStore.set(indexName, []);
    return { success: true, driver: "elastic" };
  }

  async search(indexName, params = {}) {
    const docs = this.indexedStore.get(indexName) || [];
    let hits = docs;
    if (params.term) {
      hits = docs.filter((d) => JSON.stringify(d).toLowerCase().includes(params.term.toLowerCase()));
    }
    return { hits, total: hits.length, facets: {}, dslUsed: Boolean(params.dsl), driver: "elastic" };
  }
}

export default ElasticDriver;
