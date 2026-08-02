import test from "node:test";
import assert from "node:assert/strict";
import {
  BroadcastManager,
  MemoryDriver,
  NullDriver,
  RedisDriver,
  PusherDriver,
  AblyDriver,
  SocketIODriver,
} from "../../src/index.js";

test("DriverRegistry: extends custom driver dynamically", async () => {
  const manager = new BroadcastManager();

  class CustomDriver {
    async publish(channel, event, payload) {
      return { custom: true, channel, event };
    }
  }

  manager.extend("custom", () => new CustomDriver());
  manager.use("custom");

  const res = await manager.to("custom-channel").emit("CustomEvent", { data: 123 });
  assert.equal(res.custom, true);
  assert.equal(res.channel, "custom-channel");
});

test("Drivers: validates NullDriver, RedisDriver, PusherDriver, AblyDriver, SocketIODriver", async () => {
  const nullDriver = new NullDriver();
  assert.equal((await nullDriver.publish("c", "e", {})).success, true);

  const redisDriver = new RedisDriver();
  assert.equal((await redisDriver.publish("c", "e", {})).success, true);

  const pusherDriver = new PusherDriver({ appId: "app", key: "key", secret: "secret" });
  assert.equal((await pusherDriver.publish("c", "e", {})).success, true);

  const ablyDriver = new AblyDriver({ apiKey: "key:secret" });
  assert.equal((await ablyDriver.publish("c", "e", {})).success, true);

  const socketDriver = new SocketIODriver();
  assert.equal((await socketDriver.publish("c", "e", {})).success, true);
});
