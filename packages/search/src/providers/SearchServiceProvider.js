import { ServiceProvider } from "@ecfjs/core";
import SearchManager from "../SearchManager.js";
import SearchFacade from "../facades/Search.js";

export class SearchServiceProvider extends ServiceProvider {
  register(app = this.app) {
    const container = app || this.app;
    if (!container) return;
    container.singleton("search", (c) => {
      const config = c.has("config") ? c.make("config").get("search", {}) : {};

      if (c.has("cache")) {
        config.cacheDriver = c.make("cache");
      }
      if (c.has("database")) {
        config.dbClient = c.make("database");
      }

      const manager = new SearchManager(config, c);

      if (c.has("broadcast")) {
        manager.broadcastManager = c.make("broadcast");
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
