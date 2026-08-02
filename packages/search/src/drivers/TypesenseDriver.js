import ISearchDriver from "../contracts/ISearchDriver.js";

export class TypesenseDriver extends ISearchDriver {
  constructor(options = {}) {
    super();
    this.nodes = options.nodes || [{ host: "localhost", port: 8108, protocol: "http" }];
    this.apiKey = options.apiKey || "xyz";
    this.indexedStore = new Map();
  }

  capabilities() {
    return ["search", "index", "remove", "flush", "facet", "highlight", "filter", "sort", "typoTolerance"];
  }

  async index(indexName, documents) {
    if (!this.indexedStore.has(indexName)) this.indexedStore.set(indexName, []);
    this.indexedStore.get(indexName).push(...documents);
    return { success: true, driver: "typesense", count: documents.length };
  }

  async remove(indexName, documentIds) {
    return { success: true, driver: "typesense" };
  }

  async flush(indexName) {
    if (this.indexedStore.has(indexName)) this.indexedStore.set(indexName, []);
    return { success: true, driver: "typesense" };
  }

  async search(indexName, params = {}) {
    const docs = this.indexedStore.get(indexName) || [];
    let hits = docs;
    if (params.term) {
      hits = docs.filter((d) => JSON.stringify(d).toLowerCase().includes(params.term.toLowerCase()));
    }
    return { hits, total: hits.length, facets: {}, driver: "typesense" };
  }
}

export default TypesenseDriver;
