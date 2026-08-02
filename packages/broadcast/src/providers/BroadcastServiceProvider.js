import BroadcastManager from "../BroadcastManager.js";
import BroadcastFacade from "../facades/Broadcast.js";
import BroadcastEventSubscriber from "../events/BroadcastEventSubscriber.js";

export class BroadcastServiceProvider {
  constructor(container) {
    this.container = container;
  }

  register() {
    this.container.singleton("broadcast", () => {
      const config = this.container.has("config") ? this.container.make("config").get("broadcast", {}) : {};
      const manager = new BroadcastManager(config, this.container);
      BroadcastFacade.setInstance(manager);
      return manager;
    });
  }

  boot() {
    if (this.container.has("events")) {
      const broadcastManager = this.container.make("broadcast");
      const queueManager = this.container.has("queue") ? this.container.make("queue") : null;
      const subscriber = new BroadcastEventSubscriber(broadcastManager, queueManager);
      subscriber.subscribe(this.container.make("events"));
    }
  }
}

export default BroadcastServiceProvider;
