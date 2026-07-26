import { describe, test } from "node:test";
import assert from "node:assert/strict";
import BreakNode from "../../src/ast/BreakNode.js";
import ViewError from "../../src/errors/ViewError.js";

describe("BreakNode", () => {
    test("should default condition to null (bare @break)", () => {
        assert.equal(new BreakNode().condition, null);
    });

    test("should accept a condition string", () => {
        assert.equal(new BreakNode("user.isLast").condition, "user.isLast");
    });

    test("should throw ViewError for an empty condition string", () => {
        assert.throws(() => new BreakNode(""), ViewError);
    });
});
