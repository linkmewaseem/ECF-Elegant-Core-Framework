import { ServiceProvider } from "@ecf/core";
import CacheManager from "./CacheManager.js";

export class CacheServiceProvider extends ServiceProvider {
  register(app) {
    app.singleton("cache", (app) => {
      const eventsManager = app.has("events") ? app.make("events") : null;
      const defaultStore = app.has("config") ? app.make("config").get("cache.default", "memory") : "memory";
      return new CacheManager(defaultStore, eventsManager);
    });
  }

  boot(app) {
    // Pre-wire cache layer
  }
}

export default CacheServiceProvider;
