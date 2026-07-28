import { describe, test } from "node:test";
import assert from "node:assert/strict";
import RuleRegistry from "../src/RuleRegistry.js";

describe("RuleRegistry & Pipe Parsing", () => {
    test("registers built-in default rules", () => {
        const registry = new RuleRegistry();
        assert.ok(registry.resolve("required"));
        assert.ok(registry.resolve("email"));
        assert.ok(registry.resolve("min"));
        assert.ok(registry.resolve("max"));
        assert.ok(registry.resolve("in"));
    });

    test("parses rule string pipeline like 'required|email|min:8|in:a,b'", () => {
        const registry = new RuleRegistry();
        const parsed = registry.parseRules("required|email|min:8|in:admin,user");

        assert.equal(parsed.length, 4);
        assert.equal(parsed[0].name, "required");

        assert.equal(parsed[1].name, "email");

        assert.equal(parsed[2].name, "min");
        assert.deepEqual(parsed[2].params, ["8"]);

        assert.equal(parsed[3].name, "in");
        assert.deepEqual(parsed[3].params, ["admin", "user"]);
    });

    test("registers custom rule closures via extend()", () => {
        const registry = new RuleRegistry();
        registry.register("uppercase", (val) => typeof val === "string" && val === val.toUpperCase(), "Must be uppercase");

        const rule = registry.resolve("uppercase");
        assert.ok(rule);
        assert.equal(rule.validate("HELLO"), true);
        assert.equal(rule.validate("hello"), false);
        assert.equal(rule.message(), "Must be uppercase");
    });
});
