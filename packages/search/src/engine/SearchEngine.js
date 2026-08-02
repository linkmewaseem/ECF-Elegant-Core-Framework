import Indexer from "./Indexer.js";
import QueryEngine from "./QueryEngine.js";
import IndexAliasManager from "../aliases/IndexAliasManager.js";
import SearchPipeline from "../pipeline/SearchPipeline.js";

export class SearchEngine {
  constructor(getDriverFn) {
    this.getDriverFn = getDriverFn;
    this.aliasManager = new IndexAliasManager();
    this.pipeline = new SearchPipeline();
    this.indexer = new Indexer(getDriverFn, this.aliasManager);
    this.queryEngine = new QueryEngine(getDriverFn, this.pipeline, this.aliasManager);
  }

  getIndexer() {
    return this.indexer;
  }

  getQueryEngine() {
    return this.queryEngine;
  }

  getAliasManager() {
    return this.aliasManager;
  }

  getPipeline() {
    return this.pipeline;
  }
}

export default SearchEngine;
