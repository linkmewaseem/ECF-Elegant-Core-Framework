import ISearchDriver from "../contracts/ISearchDriver.js";

export class NullDriver extends ISearchDriver {
  capabilities() {
    return ["search", "index", "remove", "flush"];
  }

  async index(indexName, documents) {
    return { success: true, driver: "null" };
  }

  async remove(indexName, documentIds) {
    return { success: true, driver: "null" };
  }

  async flush(indexName) {
    return { success: true, driver: "null" };
  }

  async search(indexName, params = {}) {
    return { hits: [], total: 0, facets: {}, driver: "null" };
  }
}

export default NullDriver;
