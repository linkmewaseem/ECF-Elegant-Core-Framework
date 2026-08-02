import SearchManager from "../SearchManager.js";
import SearchFacade from "../facades/Search.js";

export class SearchServiceProvider {
  constructor(container) {
    this.container = container;
  }

  register() {
    this.container.singleton("search", () => {
      const config = this.container.has("config") ? this.container.make("config").get("search", {}) : {};

      if (this.container.has("cache")) {
        config.cacheDriver = this.container.make("cache");
      }
      if (this.container.has("database")) {
        config.dbClient = this.container.make("database");
      }

      const manager = new SearchManager(config, this.container);

      if (this.container.has("broadcast")) {
        manager.broadcastManager = this.container.make("broadcast");
      }

      SearchFacade.setInstance(manager);
      return manager;
    });
  }

  boot() {
    // Search service provider boot setup
  }
}

export default SearchServiceProvider;
