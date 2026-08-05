import { ServiceProvider } from "@ecfjs/core";
import NotificationManager from "../internal/NotificationManager.js";

export class NotificationServiceProvider extends ServiceProvider {
  register(app) {
    app.singleton("notifications", (app) => new NotificationManager(app));
  }

  boot(app) {
    // Boot tasks
  }
}

export default NotificationServiceProvider;
