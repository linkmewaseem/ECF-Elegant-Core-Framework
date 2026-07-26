import { describe, test } from "node:test";
import assert from "node:assert/strict";
import IfNode from "../../src/ast/IfNode.js";
import TextNode from "../../src/ast/TextNode.js";
import ViewError from "../../src/errors/ViewError.js";

describe("IfNode", () => {
    test("should construct with condition, consequent, alternate, and elseIfs", () => {
        const elseIfBranch = { condition: "admin", body: [new TextNode("Admin")] };
        const node = new IfNode("user", [new TextNode("Hello")], [new TextNode("Guest")], [elseIfBranch]);
        assert.equal(node.type, "IfNode");
        assert.equal(node.condition, "user");
        assert.equal(node.consequent.length, 1);
        assert.equal(node.alternate.length, 1);
        assert.equal(node.elseIfs.length, 1);
        assert.equal(node.elseIfs[0].condition, "admin");
    });

    test("should default alternate to null and elseIfs to empty array", () => {
        const node = new IfNode("user", []);
        assert.equal(node.alternate, null);
        assert.deepEqual(node.elseIfs, []);
    });

    test("should trim whitespace from condition", () => {
        const node = new IfNode("  isAdmin  ", []);
        assert.equal(node.condition, "isAdmin");
    });

    test("should throw ViewError for empty condition", () => {
        assert.throws(() => new IfNode("", []), ViewError);
        assert.throws(() => new IfNode("   ", []), ViewError);
    });

    test("should throw ViewError for non-string condition", () => {
        assert.throws(() => new IfNode(null, []), ViewError);
        assert.throws(() => new IfNode(42, []), ViewError);
    });

    test("should throw ViewError if consequent is not an array", () => {
        assert.throws(() => new IfNode("user", null), ViewError);
        assert.throws(() => new IfNode("user", "children"), ViewError);
    });

    test("should NOT be frozen on construction (deepFreeze handles this)", () => {
        const node = new IfNode("user", []);
        assert.equal(Object.isFrozen(node), false);
    });
});
