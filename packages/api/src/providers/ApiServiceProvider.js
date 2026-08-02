import ApiManager from "../ApiManager.js";
import ApiFacade from "../facades/Api.js";

export class ApiServiceProvider {
  constructor(container) {
    this.container = container;
  }

  register() {
    this.container.singleton("api", () => {
      const config = this.container.has("config") ? this.container.make("config").get("api", {}) : {};

      if (this.container.has("cache")) {
        config.cacheDriver = this.container.make("cache");
      }

      const manager = new ApiManager(config, this.container);
      ApiFacade.setInstance(manager);
      return manager;
    });
  }

  boot() {
    // Api service provider boot setup
  }
}

export default ApiServiceProvider;
