import DriverRegistry from "./drivers/DriverRegistry.js";
import MemoryDriver from "./drivers/MemoryDriver.js";
import NullDriver from "./drivers/NullDriver.js";
import DatabaseDriver from "./drivers/DatabaseDriver.js";
import MeilisearchDriver from "./drivers/MeilisearchDriver.js";
import TypesenseDriver from "./drivers/TypesenseDriver.js";
import ElasticDriver from "./drivers/ElasticDriver.js";
import SearchEngine from "./engine/SearchEngine.js";
import SearchQueryBuilder from "./builder/SearchQueryBuilder.js";
import SearchCacheManager from "./cache/SearchCacheManager.js";
import SuggestionsEngine from "./suggestions/SuggestionsEngine.js";
import DriverCapabilities from "./capabilities/DriverCapabilities.js";
import SearchFake from "./testing/SearchFake.js";
import ReindexBatchJob from "./jobs/ReindexBatchJob.js";

export class SearchManager {
  constructor(config = {}, container = null) {
    this.config = config;
    this.container = container;
    this.defaultDriverName = config.default || "memory";
    this.driverRegistry = new DriverRegistry();
    this.cacheManager = new SearchCacheManager(config.cacheDriver);
    this.suggestionsEngine = new SuggestionsEngine();
    this.collections = new Map();

    this.registerBuiltInDrivers();

    this.engine = new SearchEngine(() => this.driver());
  }

  registerBuiltInDrivers() {
    this.driverRegistry.register("memory", () => new MemoryDriver());
    this.driverRegistry.register("null", () => new NullDriver());
    this.driverRegistry.register("database", () => new DatabaseDriver(this.config.dbClient));
    this.driverRegistry.register("meilisearch", () => new MeilisearchDriver(this.config.meilisearch || {}));
    this.driverRegistry.register("typesense", () => new TypesenseDriver(this.config.typesense || {}));
    this.driverRegistry.register("elastic", () => new ElasticDriver(this.config.elastic || {}));
  }

  driver(name = null) {
    const target = name || this.defaultDriverName;
    return this.driverRegistry.get(target);
  }

  capabilities(driverName = null) {
    const activeDriver = this.driver(driverName);
    const caps = typeof activeDriver.capabilities === "function" ? activeDriver.capabilities() : [];
    return new DriverCapabilities(caps);
  }

  extend(name, factory) {
    this.driverRegistry.register(name, factory);
    return this;
  }

  use(name) {
    this.defaultDriverName = name;
    return this;
  }

  index(indexName) {
    return new SearchQueryBuilder(indexName, this.engine, this.cacheManager, this.suggestionsEngine);
  }

  collection(collectionName, indexNames = []) {
    if (indexNames.length > 0) {
      this.collections.set(collectionName, indexNames);
    }
    const targetIndexes = this.collections.get(collectionName) || [collectionName];
    return new SearchQueryBuilder(targetIndexes, this.engine, this.cacheManager, this.suggestionsEngine);
  }

  async reindex(modelClassOrName, items = []) {
    const indexName = typeof modelClassOrName === "string" ? modelClassOrName : modelClassOrName.name.toLowerCase() + "s";
    const job = new ReindexBatchJob(this, indexName, items);
    await job.handle();
    return { success: true, indexName, itemsCount: items.length };
  }

  suggest(prefix, limit = 5) {
    return this.suggestionsEngine.suggest(prefix, limit);
  }

  fake() {
    const fakeDriver = new SearchFake();
    this.driverRegistry.setInstance("fake", fakeDriver);
    this.driverRegistry.setInstance(this.defaultDriverName, fakeDriver);
    return fakeDriver;
  }
}

export default SearchManager;
