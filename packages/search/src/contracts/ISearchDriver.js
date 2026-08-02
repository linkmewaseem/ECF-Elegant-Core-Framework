export class ISearchDriver {
  capabilities() {
    return ["search", "index", "remove", "flush"];
  }

  async index(indexName, documents) {
    throw new Error("Method 'index()' must be implemented.");
  }

  async search(indexName, params) {
    throw new Error("Method 'search()' must be implemented.");
  }

  async remove(indexName, documentIds) {
    throw new Error("Method 'remove()' must be implemented.");
  }

  async flush(indexName) {
    throw new Error("Method 'flush()' must be implemented.");
  }
}

export default ISearchDriver;
