import test from "node:test";
import assert from "node:assert/strict";
import { BroadcastManager, ShouldBroadcast, ShouldBroadcastNow, PrivateChannel } from "../../src/index.js";

test("Integration: ShouldBroadcast and ShouldBroadcastNow event dispatching", async () => {
  const manager = new BroadcastManager();
  const fake = manager.fake();

  class StandardOrderEvent extends ShouldBroadcast {
    constructor(orderId) {
      super();
      this.orderId = orderId;
    }
    broadcastOn() {
      return [new PrivateChannel(`orders.${this.orderId}`)];
    }
  }

  class SyncOrderEvent extends ShouldBroadcastNow {
    constructor(orderId) {
      super();
      this.orderId = orderId;
    }
    broadcastOn() {
      return [new PrivateChannel(`orders.${this.orderId}`)];
    }
  }

  const syncEvent = new SyncOrderEvent(777);
  const syncChannels = syncEvent.broadcastOn();
  await manager.to(syncChannels).emit(syncEvent.constructor.name, { orderId: syncEvent.orderId });

  assert.equal(fake.assertSent("SyncOrderEvent"), true);
  assert.equal(fake.assertSentOn("private-orders.777", "SyncOrderEvent"), true);
});
