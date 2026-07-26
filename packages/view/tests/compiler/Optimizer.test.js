import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Optimizer from "../../src/compiler/Optimizer.js";
import RootNode from "../../src/ast/RootNode.js";
import TextNode from "../../src/ast/TextNode.js";

describe("Optimizer", () => {
    test("optimize() should return a RootNode", () => {
        const ast = new RootNode([new TextNode("Hello")]);
        const result = new Optimizer().optimize(ast);
        assert.ok(result instanceof RootNode);
    });

    test("optimize() should merge two adjacent TextNodes into one", () => {
        const ast = new RootNode([new TextNode("Hello "), new TextNode("World")]);
        const result = new Optimizer().optimize(ast);
        assert.equal(result.children.length, 1);
        assert.equal(result.children[0].value, "Hello World");
    });

    test("optimize() should not merge non-adjacent TextNodes", () => {
        const other = { type: "ExpressionNode" };
        const ast = new RootNode([new TextNode("A"), other, new TextNode("B")]);
        const result = new Optimizer().optimize(ast);
        assert.equal(result.children.length, 3);
        assert.equal(result.children[0].value, "A");
        assert.equal(result.children[2].value, "B");
    });

    test("optimize() should pass through empty children", () => {
        const ast = new RootNode([]);
        const result = new Optimizer().optimize(ast);
        assert.equal(result.children.length, 0);
    });
});
