import { describe, test } from "node:test";
import assert from "node:assert/strict";
import ForNode from "../../src/ast/ForNode.js";
import ViewError from "../../src/errors/ViewError.js";

describe("ForNode", () => {
    test("should construct with iterable, itemName, and defaults", () => {
        const node = new ForNode("users", "user");
        assert.equal(node.type, "ForNode");
        assert.equal(node.iterable, "users");
        assert.equal(node.itemName, "user");
        assert.equal(node.indexName, null);
        assert.equal(node.keyName, null);
        assert.deepEqual(node.body, []);
    });

    test("should accept indexName", () => {
        const node = new ForNode("users", "user", "i");
        assert.equal(node.indexName, "i");
    });

    test("should throw ViewError for empty iterable or itemName", () => {
        assert.throws(() => new ForNode("", "user"), ViewError);
        assert.throws(() => new ForNode("users", ""), ViewError);
    });
});
