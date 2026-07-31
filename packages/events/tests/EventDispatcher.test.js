import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Application } from "@ecf/core";
import {
  Event,
  EventManager,
  EventDispatcher,
  EventSubscriber,
  EventServiceProvider,
  ShouldQueue,
} from "../src/index.js";

class UserRegistered extends Event {
  constructor(user) {
    super({ user });
    this.user = user;
  }
}

class UserSubscriber extends EventSubscriber {
  subscribe(dispatcher) {
    dispatcher.listen("UserRegistered", (event) => "Welcome email sent");
  }
}

describe("@ecf/events — Enterprise Event System Tests", () => {

  test("Event dispatching and listener resolution", async () => {
    const manager = new EventManager();
    let handled = false;

    manager.listen("UserRegistered", (event) => {
      handled = true;
      assert.equal(event.user.name, "Ali");
    });

    await manager.dispatch(new UserRegistered({ name: "Ali" }));
    assert.equal(handled, true);
  });

  test("Priority sorting and propagation halting", async () => {
    const manager = new EventManager();
    const order = [];

    manager.listen("test.event", () => { order.push("low"); }, 10);
    manager.listen("test.event", (payload, ctx) => {
      order.push("high");
      ctx.stop();
    }, 100);

    await manager.dispatch("test.event");
    assert.deepEqual(order, ["high"]);
  });

  test("Wildcard pattern routing (user.*)", async () => {
    const manager = new EventManager();
    let wildcardTriggered = false;

    manager.listen("user.*", () => {
      wildcardTriggered = true;
    });

    await manager.dispatch("user.created", { id: 1 });
    assert.equal(wildcardTriggered, true);
  });

  test("Event Fake and testing assertions", async () => {
    const manager = new EventManager();
    manager.fake();

    await manager.dispatch(new UserRegistered({ name: "Sara" }));
    assert.doesNotThrow(() => manager.assertDispatched(UserRegistered));
    assert.throws(() => manager.assertNotDispatched(UserRegistered));
  });

  test("Transaction event commit buffering", async () => {
    const manager = new EventManager();
    let dispatched = false;

    manager.listen("OrderPlaced", () => {
      dispatched = true;
    });

    manager.beginTransaction();
    await manager.dispatch("OrderPlaced");
    assert.equal(dispatched, false); // Buffered during transaction

    await manager.commitTransaction();
    assert.equal(dispatched, true); // Flushed after commit
  });

  test("EventServiceProvider IoC binding", () => {
    const app = new Application();
    app.register(EventServiceProvider);
    app.boot();

    const events = app.make("events");
    assert.ok(events instanceof EventManager);
  });

});
