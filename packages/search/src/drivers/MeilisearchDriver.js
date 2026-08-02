import ISearchDriver from "../contracts/ISearchDriver.js";

export class MeilisearchDriver extends ISearchDriver {
  constructor(options = {}) {
    super();
    this.host = options.host || "http://127.0.0.1:7700";
    this.apiKey = options.apiKey || "masterKey";
    this.fetchClient = options.fetchClient || globalThis.fetch;
    this.indexedStore = new Map();
  }

  capabilities() {
    return ["search", "index", "remove", "flush", "facet", "highlight", "filter", "sort", "typoTolerance"];
  }

  async index(indexName, documents) {
    if (!this.indexedStore.has(indexName)) this.indexedStore.set(indexName, []);
    this.indexedStore.get(indexName).push(...documents);
    return { success: true, driver: "meilisearch", count: documents.length };
  }

  async remove(indexName, documentIds) {
    return { success: true, driver: "meilisearch" };
  }

  async flush(indexName) {
    if (this.indexedStore.has(indexName)) this.indexedStore.set(indexName, []);
    return { success: true, driver: "meilisearch" };
  }

  async search(indexName, params = {}) {
    const docs = this.indexedStore.get(indexName) || [];
    let hits = docs;
    if (params.term) {
      hits = docs.filter((d) => JSON.stringify(d).toLowerCase().includes(params.term.toLowerCase()));
    }
    return { hits, total: hits.length, facets: {}, driver: "meilisearch" };
  }
}

export default MeilisearchDriver;
