import { ServiceProvider } from "@ecfjs/core";
import QueueManager from "../internal/QueueManager.js";

export class QueueServiceProvider extends ServiceProvider {
  register(app) {
    app.singleton("queue", (app) => new QueueManager(app));
  }

  boot(app) {
    // Perform any boot tasks
  }
}

export default QueueServiceProvider;
