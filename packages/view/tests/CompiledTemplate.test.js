import { describe, test } from "node:test";
import assert from "node:assert/strict";
import CompiledTemplate from "../src/CompiledTemplate.js";
import ViewError from "../src/errors/ViewError.js";

describe("CompiledTemplate", () => {
    const makeTemplate = (overrides = {}) => new CompiledTemplate({
        name: "home",
        ast: { type: "Root", children: [] },
        render: () => "<h1>Hello</h1>",
        assets: { css: [], js: [], fonts: [], images: [] },
        dependencies: [],
        hash: "abc123",
        compiledAt: Date.now(),
        ...overrides
    });

    test("should construct and expose all fields", () => {
        const t = makeTemplate();
        assert.equal(t.name, "home");
        assert.equal(typeof t.render, "function");
        assert.equal(typeof t.hash, "string");
        assert.equal(typeof t.compiledAt, "number");
    });

    test("should be frozen after construction", () => {
        const t = makeTemplate();
        assert.ok(Object.isFrozen(t));
        assert.throws(() => { t.name = "hacked"; }, TypeError);
    });

    test("should throw ViewError if render is not a function", () => {
        assert.throws(() => makeTemplate({ render: "not-a-function" }), ViewError);
    });

    test("toJSON() should omit render and ast", () => {
        const t = makeTemplate();
        const json = t.toJSON();
        assert.ok(!("render" in json));
        assert.ok(!("ast" in json));
        assert.equal(json.name, "home");
    });

    test("invalidate() should throw ViewError", () => {
        assert.throws(() => makeTemplate().invalidate(), ViewError);
    });
});
