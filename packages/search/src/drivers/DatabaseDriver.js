import ISearchDriver from "../contracts/ISearchDriver.js";
import MemoryDriver from "./MemoryDriver.js";

export class DatabaseDriver extends ISearchDriver {
  constructor(dbClient = null) {
    super();
    this.dbClient = dbClient;
    this.memoryFallback = new MemoryDriver();
  }

  capabilities() {
    return ["search", "index", "remove", "flush", "filter", "sort"];
  }

  async index(indexName, documents) {
    return await this.memoryFallback.index(indexName, documents);
  }

  async remove(indexName, documentIds) {
    return await this.memoryFallback.remove(indexName, documentIds);
  }

  async flush(indexName) {
    return await this.memoryFallback.flush(indexName);
  }

  async search(indexName, params = {}) {
    return await this.memoryFallback.search(indexName, params);
  }
}

export default DatabaseDriver;
