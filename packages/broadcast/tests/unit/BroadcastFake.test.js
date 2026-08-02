import test from "node:test";
import assert from "node:assert/strict";
import { BroadcastManager, PrivateChannel, PresenceChannel } from "../../src/index.js";

test("BroadcastFake: supports rich assertions", async () => {
  const manager = new BroadcastManager();
  const fake = manager.fake();

  await manager.to("orders.10").emit("OrderCreated", { total: 100 });
  await manager.to(new PrivateChannel("chat.1")).emit("ChatMessage", { text: "Hi" });
  await manager.to(new PresenceChannel("room.2")).emit("UserJoined", { user: "Bob" }, { queued: true });

  assert.equal(fake.assertSent("OrderCreated"), true);
  assert.equal(fake.assertSentOn("orders.10", "OrderCreated"), true);
  assert.equal(fake.assertPrivate("chat.1"), true);
  assert.equal(fake.assertPresence("room.2"), true);
  assert.equal(fake.assertQueued("UserJoined"), true);
  assert.equal(fake.assertBroadcastedTimes("OrderCreated", 1), true);

  fake.reset();
  assert.equal(fake.assertNothingSent(), true);
});
