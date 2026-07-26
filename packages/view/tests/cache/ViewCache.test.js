import { describe, test } from "node:test";
import assert from "node:assert/strict";
import ViewCache from "../../src/cache/ViewCache.js";

describe("ViewCache", () => {
    test("invalidate(id) should remove a single entry", () => {
        const cache = new ViewCache();
        cache.set("home", { dependencies: [] });
        cache.invalidate("home");
        assert.equal(cache.has("home"), false);
    });

    test("invalidateByDependency() should evict all dependents", () => {
        const cache = new ViewCache();
        cache.set("home", { dependencies: ["layout.main"] });
        cache.set("about", { dependencies: ["layout.main"] });
        cache.set("contact", { dependencies: [] });

        cache.invalidateByDependency("layout.main");

        assert.equal(cache.has("home"), false);
        assert.equal(cache.has("about"), false);
        assert.equal(cache.has("contact"), true);
    });

    test("clear() should empty both store and dependency graph", () => {
        const cache = new ViewCache();
        cache.set("home", { dependencies: ["layout.main"] });
        cache.clear();
        assert.equal(cache.has("home"), false);
        cache.set("about", { dependencies: [] });
        cache.invalidateByDependency("layout.main"); // should be a no-op now
        assert.equal(cache.has("about"), true);
    });
});
