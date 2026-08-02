import test from "node:test";
import assert from "node:assert/strict";
import { BroadcastManager, PrivateChannel, PresenceChannel } from "../../src/index.js";

test("BroadcastManager: resolves default memory driver and broadcasts event", async () => {
  const manager = new BroadcastManager();

  const result = await manager.to("chat.room1").emit("UserJoined", { userId: 42 });

  assert.equal(result.success, true);
  assert.equal(result.record.channel, "chat.room1");
  assert.equal(result.record.event, "UserJoined");
  assert.equal(result.record.payload.userId, 42);
});

test("BroadcastManager: fluent private and presence channels", async () => {
  const manager = new BroadcastManager();

  const priv = manager.private("orders.99");
  assert.equal(priv instanceof PrivateChannel, true);
  assert.equal(priv.name, "private-orders.99");

  const pres = manager.presence("room.5");
  assert.equal(pres instanceof PresenceChannel, true);
  assert.equal(pres.name, "presence-room.5");
});
