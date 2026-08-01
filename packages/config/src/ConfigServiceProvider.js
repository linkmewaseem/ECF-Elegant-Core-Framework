import { ServiceProvider } from "@ecf/core";
import ConfigRepository from "./ConfigRepository.js";

export class ConfigServiceProvider extends ServiceProvider {
  register(app) {
    app.singleton("config", (app) => {
      const eventsManager = app.has("events") ? app.make("events") : null;
      return new ConfigRepository({}, eventsManager);
    });
  }

  boot(app) {
    // Pre-wire configuration
  }
}

export default ConfigServiceProvider;
