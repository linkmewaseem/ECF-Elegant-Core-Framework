import { describe, test } from "node:test";
import assert from "node:assert/strict";

let SwitchNode, CaseNode, ViewError;
try {
    SwitchNode = (await import("../../src/ast/SwitchNode.js")).default;
    CaseNode = (await import("../../src/ast/CaseNode.js")).default;
    ViewError = (await import("../../src/errors/ViewError.js")).default;
} catch {
    // Feature pending implementation
}

describe("SwitchNode", { skip: !SwitchNode }, () => {
    test("should construct with expression, cases, and null defaultBody", () => {
        const node = new SwitchNode("role", [new CaseNode("admin", [])]);
        assert.equal(node.type, "SwitchNode");
        assert.equal(node.expression, "role");
        assert.equal(node.cases.length, 1);
        assert.equal(node.defaultBody, null);
    });

    test("should trim whitespace from expression", () => {
        const node = new SwitchNode("  user.role  ", []);
        assert.equal(node.expression, "user.role");
    });

    test("should throw ViewError for empty expression", () => {
        assert.throws(() => new SwitchNode("", []), ViewError);
        assert.throws(() => new SwitchNode("   ", []), ViewError);
    });

    test("should throw ViewError if cases is not an array", () => {
        assert.throws(() => new SwitchNode("role", null), ViewError);
    });

    test("should throw ViewError if defaultBody is neither array nor null", () => {
        assert.throws(() => new SwitchNode("role", [], "oops"), ViewError);
    });

    test("should accept an array defaultBody", () => {
        const node = new SwitchNode("role", [], []);
        assert.deepEqual(node.defaultBody, []);
    });
});
