import { describe, test } from "node:test";
import assert from "node:assert/strict";
import RootNode from "../../src/ast/RootNode.js";
import TextNode from "../../src/ast/TextNode.js";
import ViewError from "../../src/errors/ViewError.js";

describe("RootNode", () => {
    test("should construct with an array of children", () => {
        const node = new RootNode([new TextNode("hi")]);
        assert.equal(node.type, "Root");
        assert.equal(node.children.length, 1);
    });

    test("should make a shallow copy of children, not share the array reference", () => {
        const children = [new TextNode("hi")];
        const node = new RootNode(children);
        children.push(new TextNode("extra"));
        assert.equal(node.children.length, 1); // original unaffected
    });

    test("should throw ViewError for non-array argument", () => {
        assert.throws(() => new RootNode("not an array"), ViewError);
        assert.throws(() => new RootNode(null), ViewError);
    });
});

describe("TextNode", () => {
    test("should construct with a string value", () => {
        const node = new TextNode("Hello");
        assert.equal(node.type, "TextNode");
        assert.equal(node.value, "Hello");
    });

    test("should throw ViewError for non-string value", () => {
        assert.throws(() => new TextNode(123), ViewError);
        assert.throws(() => new TextNode(null), ViewError);
    });

    test("should NOT be frozen on construction (deepFreeze handles this)", () => {
        const node = new TextNode("Hello");
        assert.equal(Object.isFrozen(node), false);
    });
});
