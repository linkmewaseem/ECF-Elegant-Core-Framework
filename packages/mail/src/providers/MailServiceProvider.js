import { ServiceProvider } from "@ecf/core";
import MailManager from "../internal/MailManager.js";

export class MailServiceProvider extends ServiceProvider {
  register(app) {
    app.singleton("mail", (app) => new MailManager(app));
  }

  boot(app) {
    // Boot tasks
  }
}

export default MailServiceProvider;
