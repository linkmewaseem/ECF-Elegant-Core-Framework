import { describe, test } from "node:test";
import assert from "node:assert/strict";

let CaseNode, ViewError;
try {
    CaseNode = (await import("../../src/ast/CaseNode.js")).default;
    ViewError = (await import("../../src/errors/ViewError.js")).default;
} catch {
    // Feature pending implementation
}

describe("CaseNode", { skip: !CaseNode }, () => {
    test("should store a string literal value and body", () => {
        const node = new CaseNode("admin", []);
        assert.equal(node.type, "CaseNode");
        assert.equal(node.value, "admin");
        assert.deepEqual(node.body, []);
    });

    test("should store number/boolean/null literal values as-is", () => {
        assert.equal(new CaseNode(1, []).value, 1);
        assert.equal(new CaseNode(true, []).value, true);
        assert.equal(new CaseNode(null, []).value, null);
    });

    test("should throw ViewError if body is not an array", () => {
        assert.throws(() => new CaseNode("admin", null), ViewError);
        assert.throws(() => new CaseNode("admin", "oops"), ViewError);
    });
});
