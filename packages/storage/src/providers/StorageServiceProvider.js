import { ServiceProvider } from "@ecf/core";
import StorageManager from "../internal/StorageManager.js";

export class StorageServiceProvider extends ServiceProvider {
  register(app) {
    app.singleton("storage", (app) => new StorageManager(app));
  }

  boot(app) {
    // Perform any boot tasks
  }
}

export default StorageServiceProvider;
