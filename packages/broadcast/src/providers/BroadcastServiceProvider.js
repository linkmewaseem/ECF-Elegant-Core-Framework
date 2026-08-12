import { ServiceProvider } from "@ecfjs/core";
import BroadcastManager from "../BroadcastManager.js";
import BroadcastFacade from "../facades/Broadcast.js";
import BroadcastEventSubscriber from "../events/BroadcastEventSubscriber.js";

export class BroadcastServiceProvider extends ServiceProvider {
  register(app = this.app) {
    const container = app || this.app;
    if (!container) return;
    container.singleton("broadcast", (c) => {
      const config = c.has("config") ? c.make("config").get("broadcast", {}) : {};
      const manager = new BroadcastManager(config, c);
      BroadcastFacade.setInstance(manager);
      return manager;
    });
  }

  boot(app = this.app) {
    const container = app || this.app;
    if (!container) return;
    if (container.has("events")) {
      const broadcastManager = container.make("broadcast");
      const queueManager = container.has("queue") ? container.make("queue") : null;
      const subscriber = new BroadcastEventSubscriber(broadcastManager, queueManager);
      subscriber.subscribe(container.make("events"));
    }
  }
}

export default BroadcastServiceProvider;
