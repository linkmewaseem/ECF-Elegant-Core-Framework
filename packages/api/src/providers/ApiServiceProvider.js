import { ServiceProvider } from "@ecfjs/core";
import ApiManager from "../ApiManager.js";
import ApiFacade from "../facades/Api.js";

export class ApiServiceProvider extends ServiceProvider {
  register(app = this.app) {
    const container = app || this.app;
    if (!container) return;
    container.singleton("api", (c) => {
      const config = c.has("config") ? c.make("config").get("api", {}) : {};

      if (c.has("cache")) {
        config.cacheDriver = c.make("cache");
      }

      const manager = new ApiManager(config, c);
      ApiFacade.setInstance(manager);
      return manager;
    });
  }

  boot() {
    // Api service provider boot setup
  }
}

export default ApiServiceProvider;
