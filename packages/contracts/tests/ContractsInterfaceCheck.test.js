import test from "node:test";
import assert from "node:assert/strict";
import { IAuthManager, ICacheManager, IQueueManager, IMailManager, INotificationManager, IStorageManager } from "../src/index.js";

test("Contracts - verifies zero runtime weight interface definitions", () => {
  const auth = new IAuthManager();
  const cache = new ICacheManager();
  const queue = new IQueueManager();
  const mail = new IMailManager();
  const notif = new INotificationManager();
  const storage = new IStorageManager();

  assert.throws(() => auth.guard(), /Contract interface method/);
  assert.throws(() => cache.get("key"), /Contract interface method/);
  assert.throws(() => queue.push({}), /Contract interface method/);
  assert.throws(() => mail.send({}), /Contract interface method/);
  assert.throws(() => notif.send({}), /Contract interface method/);
  assert.throws(() => storage.get("file"), /Contract interface method/);
});
