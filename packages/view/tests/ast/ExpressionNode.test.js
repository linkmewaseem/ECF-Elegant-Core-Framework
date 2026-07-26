import { describe, test } from "node:test";
import assert from "node:assert/strict";
import ExpressionNode from "../../src/ast/ExpressionNode.js";
import ViewError from "../../src/errors/ViewError.js";

describe("ExpressionNode", () => {
    test("should construct with a trimmed expression string", () => {
        const node = new ExpressionNode("  name  ");
        assert.equal(node.type, "ExpressionNode");
        assert.equal(node.expression, "name");
    });

    test("should throw ViewError for empty or whitespace-only expression", () => {
        assert.throws(() => new ExpressionNode(""), ViewError);
        assert.throws(() => new ExpressionNode("   "), ViewError);
    });

    test("should throw ViewError for non-string expression", () => {
        assert.throws(() => new ExpressionNode(null), ViewError);
        assert.throws(() => new ExpressionNode(42), ViewError);
    });

    test("should NOT be frozen on construction (deepFreeze handles this)", () => {
        const node = new ExpressionNode("name");
        assert.equal(Object.isFrozen(node), false);
    });
});
