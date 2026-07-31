import { ServiceProvider } from "@ecf/core";
import EventDispatcher from "./EventDispatcher.js";
import EventManager from "./EventManager.js";

export class EventServiceProvider extends ServiceProvider {
  register(app) {
    app.singleton("events.dispatcher", () => new EventDispatcher(app.container));
    app.singleton("events", (app) => new EventManager(app.make("events.dispatcher")));
  }

  boot(app) {
    // Pre-wire event framework
  }
}

export default EventServiceProvider;
