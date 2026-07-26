import { describe, test } from "node:test";
import assert from "node:assert/strict";
import lookup from "../../src/utils/lookup.js";

describe("lookup", () => {
    test("should resolve a top-level key", () => {
        assert.equal(lookup({ name: "Waseem" }, "name"), "Waseem");
    });

    test("should resolve dot-notation paths (user.name)", () => {
        assert.equal(lookup({ user: { name: "Ashir" } }, "user.name"), "Ashir");
    });

    test("should resolve deeply nested paths", () => {
        assert.equal(lookup({ a: { b: { c: 42 } } }, "a.b.c"), 42);
    });

    test("should return undefined for missing keys", () => {
        assert.equal(lookup({ user: {} }, "user.name"), undefined);
        assert.equal(lookup({}, "missing"), undefined);
    });

    test("should return undefined when traversing through null/undefined", () => {
        assert.equal(lookup({ user: null }, "user.name"), undefined);
    });

    test("should return falsy (but defined) values correctly — 0, false, empty string", () => {
        assert.equal(lookup({ count: 0 }, "count"), 0);
        assert.equal(lookup({ active: false }, "active"), false);
        assert.equal(lookup({ label: "" }, "label"), "");
    });

    test("should return undefined for null/undefined obj", () => {
        assert.equal(lookup(null, "name"), undefined);
        assert.equal(lookup(undefined, "name"), undefined);
    });

    test("should return undefined for empty or non-string path", () => {
        assert.equal(lookup({ a: 1 }, ""), undefined);
        assert.equal(lookup({ a: 1 }, "   "), undefined);
        assert.equal(lookup({ a: 1 }, null), undefined);
    });
});
