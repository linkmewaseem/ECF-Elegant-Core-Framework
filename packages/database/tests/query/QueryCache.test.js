import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryCache from "../../src/query/cache/QueryCache.js";
import RedisCacheStore from "../../src/query/cache/stores/RedisCacheStore.js";
import QueryMetrics from "../../src/profiler/QueryMetrics.js";

describe("QueryCache & Cache Stores", () => {
    let queryCache;
    let metrics;

    beforeEach(() => {
        metrics = new QueryMetrics();
        queryCache = new QueryCache("memory", metrics);
    });

    test("stores and retrieves cached query results using MemoryCacheStore", async () => {
        const key = "users_active";
        const val = [{ id: 1, name: "Alice" }];

        queryCache.put(key, val, 60);
        const cached = queryCache.get(key);

        assert.deepEqual(cached, val);
        assert.equal(metrics.getMetrics("Cache").hits, 1);
    });

    test("handles cache misses and increments miss counter", () => {
        const cached = queryCache.get("non_existent");
        assert.equal(cached, null);
        assert.equal(metrics.getMetrics("Cache").misses, 1);
    });

    test("supports remember() closure caching", async () => {
        let count = 0;
        const callback = async () => {
            count++;
            return [{ id: 2, name: "Bob" }];
        };

        const res1 = await queryCache.remember("remember_key", 60, callback);
        const res2 = await queryCache.remember("remember_key", 60, callback);

        assert.deepEqual(res1, [{ id: 2, name: "Bob" }]);
        assert.deepEqual(res2, [{ id: 2, name: "Bob" }]);
        assert.equal(count, 1);
    });

    test("flushes tag-associated query caches", () => {
        queryCache.put("user_1", { id: 1 }, 60, ["users"]);
        queryCache.put("user_2", { id: 2 }, 60, ["users"]);
        queryCache.put("post_1", { id: 10 }, 60, ["posts"]);

        queryCache.flushTags(["users"]);

        assert.equal(queryCache.get("user_1"), null);
        assert.equal(queryCache.get("user_2"), null);
        assert.deepEqual(queryCache.get("post_1"), { id: 10 });
    });

    test("routes through RedisCacheStore adapter", () => {
        const redisStore = new RedisCacheStore();
        queryCache.registerStore("redis", redisStore);

        queryCache.put("redis_key", "hello", 60, [], "redis");
        assert.equal(queryCache.get("redis_key", "redis"), "hello");
    });
});
