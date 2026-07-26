import { describe, test } from "node:test";
import assert from "node:assert/strict";
import ContinueNode from "../../src/ast/ContinueNode.js";
import ViewError from "../../src/errors/ViewError.js";

describe("ContinueNode", () => {
    test("should default condition to null (bare @continue)", () => {
        assert.equal(new ContinueNode().condition, null);
    });

    test("should accept a condition string", () => {
        assert.equal(new ContinueNode("user.active").condition, "user.active");
    });

    test("should throw ViewError for an empty condition string", () => {
        assert.throws(() => new ContinueNode(""), ViewError);
    });
});
