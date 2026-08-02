import ISearchDriver from "../contracts/ISearchDriver.js";

export class SearchFake extends ISearchDriver {
  constructor() {
    super();
    this.searches = [];
    this.indexedDocs = [];
    this.removedDocs = [];
    this.driverName = "fake";
  }

  capabilities() {
    return ["search", "index", "remove", "flush", "facet", "highlight", "aggregate", "filter", "sort", "dsl"];
  }

  async index(indexName, documents) {
    const docs = Array.isArray(documents) ? documents : [documents];
    for (const doc of docs) {
      this.indexedDocs.push({ indexName, doc, timestamp: Date.now() });
    }
    return { success: true, count: docs.length, driver: "fake" };
  }

  async remove(indexName, documentIds) {
    const ids = Array.isArray(documentIds) ? documentIds : [documentIds];
    for (const id of ids) {
      this.removedDocs.push({ indexName, id, timestamp: Date.now() });
    }
    return { success: true, count: ids.length, driver: "fake" };
  }

  async flush(indexName) {
    this.indexedDocs = this.indexedDocs.filter((item) => item.indexName !== indexName);
    return { success: true, indexName, driver: "fake" };
  }

  async search(indexName, params = {}) {
    const record = { indexName, params, timestamp: Date.now() };
    this.searches.push(record);

    const matches = this.indexedDocs
      .filter((item) => item.indexName === indexName)
      .map((item) => item.doc);

    return { hits: matches, total: matches.length, facets: {}, driver: "fake" };
  }

  assertSearched(termFilter, callback = null) {
    const matched = this.searches.filter((item) => {
      const termMatch = typeof termFilter === "string" ? item.params.term === termFilter : true;
      if (!termMatch) return false;
      return callback ? callback(item.params, item) : true;
    });

    if (matched.length === 0) {
      throw new Error(`Search assertion failed: Expected search query [${termFilter}] was not executed.`);
    }
    return true;
  }

  assertNothingSearched() {
    if (this.searches.length > 0) {
      throw new Error(`Search assertion failed: Expected no search queries, but [${this.searches.length}] were executed.`);
    }
    return true;
  }

  assertIndexed(indexName, documentId = null) {
    const matched = this.indexedDocs.filter((item) => {
      if (item.indexName !== indexName) return false;
      if (documentId !== null) return item.doc.id === documentId || item.doc === documentId;
      return true;
    });

    if (matched.length === 0) {
      throw new Error(`Search assertion failed: Expected documents to be indexed on index [${indexName}].`);
    }
    return true;
  }

  assertRemoved(indexName, documentId = null) {
    const matched = this.removedDocs.filter((item) => {
      if (item.indexName !== indexName) return false;
      if (documentId !== null) return item.id === documentId;
      return true;
    });

    if (matched.length === 0) {
      throw new Error(`Search assertion failed: Expected documents to be removed from index [${indexName}].`);
    }
    return true;
  }

  assertDriver(expectedDriver) {
    if (this.driverName !== expectedDriver && expectedDriver !== "fake") {
      throw new Error(`Search assertion failed: Expected driver [${expectedDriver}], but got [${this.driverName}].`);
    }
    return true;
  }

  reset() {
    this.searches = [];
    this.indexedDocs = [];
    this.removedDocs = [];
  }
}

export default SearchFake;
