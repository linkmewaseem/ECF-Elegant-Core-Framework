import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Application } from "@ecf/core";
import { EventManager } from "@ecf/events";
import {
  CacheManager,
  CacheServiceProvider,
  Cache,
} from "../src/index.js";

describe("@ecf/cache — Enterprise Cache Abstraction Platform Tests", () => {

  test("CacheManager get, put, remember, and forget across stores", async () => {
    const manager = new CacheManager("memory");
    manager.put("key1", "val1", 60);
    assert.equal(manager.get("key1"), "val1");

    const remembered = await manager.remember("key2", 60, () => "computed");
    assert.equal(remembered, "computed");
    assert.equal(manager.get("key2"), "computed");

    manager.forget("key1");
    assert.equal(manager.get("key1"), null);
  });

  test("Cache stampede protection prevents duplicate callback executions", async () => {
    const manager = new CacheManager("memory");
    let executionCount = 0;

    const callback = async () => {
      executionCount++;
      await new Promise((r) => setTimeout(r, 20));
      return "result";
    };

    const p1 = manager.remember("stampede_key", 60, callback);
    const p2 = manager.remember("stampede_key", 60, callback);

    const [res1, res2] = await Promise.all([p1, p2]);
    assert.equal(res1, "result");
    assert.equal(res2, "result");
    assert.equal(executionCount, 1); // Only 1 execution despite 2 concurrent requests
  });

  test("Atomic Distributed CacheLock acquisition, ownership, and release", () => {
    const manager = new CacheManager("memory");
    const lock1 = manager.lock("deploy", 10);
    const lock2 = manager.lock("deploy", 10);

    assert.equal(lock1.acquire(), true);
    assert.equal(lock1.isOwned(), true);

    // lock2 cannot acquire because lock1 owns it
    assert.equal(lock2.acquire(), false);

    assert.equal(lock1.release(), true);
    assert.equal(lock2.acquire(), true);
  });

  test("Tagged Cache invalidation (Cache.tags())", () => {
    const manager = new CacheManager("memory");
    const tagged = manager.tags(["users", "reports"]);

    tagged.put("user_1", { name: "Ali" });
    assert.deepEqual(tagged.get("user_1"), { name: "Ali" });

    tagged.flush();
    assert.equal(tagged.get("user_1"), null);
  });

  test("Cache events dispatched over @ecf/events", async () => {
    const events = new EventManager();
    let hitEvent = false;

    events.listen("CacheHit", () => {
      hitEvent = true;
    });

    const manager = new CacheManager("memory", events);
    manager.put("test", "data");
    manager.get("test");

    assert.equal(hitEvent, true);
  });

  test("CacheServiceProvider IoC binding & Facade integration", () => {
    const app = new Application();
    app.register(CacheServiceProvider);
    app.boot();

    Cache.setApplication(app);
    Cache.put("session_id", "xyz123");
    assert.equal(Cache.get("session_id"), "xyz123");
  });

});
