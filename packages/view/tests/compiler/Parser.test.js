import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Parser from "../../src/compiler/Parser.js";
import RootNode from "../../src/ast/RootNode.js";
import TextNode from "../../src/ast/TextNode.js";
import IfNode from "../../src/ast/IfNode.js";
import ViewError from "../../src/errors/ViewError.js";
import Lexer from "../../src/compiler/Lexer.js";

describe("Parser", () => {
    test("parse() should return a RootNode with TextNode children", () => {
        const tokens = [{ type: "Text", value: "<h1>Hello</h1>", line: 1, column: 1 }];
        const ast = new Parser().parse(tokens);
        assert.ok(ast instanceof RootNode);
        assert.equal(ast.children.length, 1);
        assert.ok(ast.children[0] instanceof TextNode);
        assert.equal(ast.children[0].value, "<h1>Hello</h1>");
    });

    test("parse() should produce an empty RootNode for empty token array", () => {
        const ast = new Parser().parse([]);
        assert.ok(ast instanceof RootNode);
        assert.equal(ast.children.length, 0);
    });

    test("parse() should throw ViewError for unknown token types in leaf position", () => {
        const unknownToken = { type: "Unknown", value: "x", line: 2, column: 5 };
        assert.throws(() => new Parser().parse([unknownToken]), ViewError);
    });

    // ---- @if / @endif ----

    test("parse() should produce IfNode from IfOpen + children + IfClose", () => {
        const tokens = [
            { type: "IfOpen",  value: "user", line: 1, column: 1 },
            { type: "Text",    value: "Hello", line: 2, column: 1 },
            { type: "IfClose", value: null,   line: 3, column: 1 }
        ];
        const ast = new Parser().parse(tokens);
        assert.equal(ast.children.length, 1);
        assert.ok(ast.children[0] instanceof IfNode);
        assert.equal(ast.children[0].condition, "user");
        assert.equal(ast.children[0].consequent.length, 1);
        assert.ok(ast.children[0].consequent[0] instanceof TextNode);
    });

    test("parse() should produce IfNode with empty consequent for @if@endif with no body", () => {
        const tokens = [
            { type: "IfOpen",  value: "user", line: 1, column: 1 },
            { type: "IfClose", value: null,   line: 1, column: 10 }
        ];
        const ast = new Parser().parse(tokens);
        assert.equal(ast.children[0].consequent.length, 0);
    });

    test("parse() should handle nested @if blocks", () => {
        const tokens = [
            { type: "IfOpen",  value: "user",  line: 1, column: 1 },
            { type: "IfOpen",  value: "admin", line: 2, column: 1 },
            { type: "Text",    value: "Hi",    line: 3, column: 1 },
            { type: "IfClose", value: null,    line: 4, column: 1 },
            { type: "IfClose", value: null,    line: 5, column: 1 }
        ];
        const ast = new Parser().parse(tokens);
        const outerIf = ast.children[0];
        assert.ok(outerIf instanceof IfNode);
        assert.equal(outerIf.condition, "user");
        assert.equal(outerIf.consequent.length, 1);
        const innerIf = outerIf.consequent[0];
        assert.ok(innerIf instanceof IfNode);
        assert.equal(innerIf.condition, "admin");
        assert.equal(innerIf.consequent[0].value, "Hi");
    });

    test("parse() should throw ViewError for unclosed @if (missing @endif)", () => {
        const tokens = [
            { type: "IfOpen", value: "user", line: 1, column: 1 }
        ];
        assert.throws(() => new Parser().parse(tokens), ViewError);
    });

    test("parse() should throw ViewError for orphan @endif without @if", () => {
        const tokens = [
            { type: "IfClose", value: null, line: 1, column: 1 }
        ];
        assert.throws(() => new Parser().parse(tokens), ViewError);
    });

    test("parse() should produce ForNode from ForOpen + body + ForClose", () => {
        const tokens = [
            { type: "ForOpen", value: { iterable: "users", itemName: "user", indexName: null }, line: 1 },
            { type: "Expression", value: "user.name", line: 2 },
            { type: "ForClose", value: null, line: 3 }
        ];
        const ast = new Parser().parse(tokens);
        const forNode = ast.children[0];
        assert.equal(forNode.type, "ForNode");
        assert.equal(forNode.iterable, "users");
        assert.equal(forNode.body.length, 1);
    });

    test("parse() should throw ViewError for unclosed @for", () => {
        const tokens = [{ type: "ForOpen", value: { iterable: "users", itemName: "user", indexName: null }, line: 1 }];
        assert.throws(() => new Parser().parse(tokens), ViewError);
    });

    test("parse() should support @if nested inside @for and vice versa", () => {
        const tokens = new Lexer().lex("@for(users as user)@if(user.active){{ user.name }}@endif@endfor");
        const ast = new Parser().parse(tokens);
        const forNode = ast.children[0];
        assert.equal(forNode.body[0].type, "IfNode");
    });

    test("parse() should produce BreakNode/ContinueNode as leaf nodes", () => {
        const tokens = new Lexer().lex("@break @continue(user.active)");
        const ast = new Parser().parse(tokens);
        assert.equal(ast.children.filter((n) => n.type === "TextNode").length > 0, true); // the space between
        assert.equal(ast.children.find((n) => n.type === "BreakNode").condition, null);
        assert.equal(ast.children.find((n) => n.type === "ContinueNode").condition, "user.active");
    });
});
