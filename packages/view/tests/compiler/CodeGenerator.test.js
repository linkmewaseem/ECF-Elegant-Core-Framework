import { describe, test } from "node:test";
import assert from "node:assert/strict";
import CodeGenerator from "../../src/compiler/CodeGenerator.js";
import ViewError from "../../src/errors/ViewError.js";
import Compiler from "../../src/Compiler.js";

describe("CodeGenerator", () => {
    test("generate() should throw ViewError if AST is not a Root node", () => {
        assert.throws(() => new CodeGenerator().generate(null), ViewError);
        assert.throws(() => new CodeGenerator().generate({ type: "TextNode", children: [] }), ViewError);
    });

    test("generate() should return a render function for a valid Root AST", () => {
        const ast = { type: "Root", children: [{ type: "TextNode", value: "<h1>Hi</h1>" }] };
        const render = new CodeGenerator().generate(ast);
        assert.equal(typeof render, "function");
        assert.equal(render({}), "<h1>Hi</h1>");
    });

    test("renderNode() should throw ViewError for unknown node types", () => {
        assert.throws(
            () => CodeGenerator.renderNode({ type: "UnknownNode" }, {}),
            ViewError
        );
    });

    test("generate() should concatenate multiple TextNode children", () => {
        const ast = {
            type: "Root",
            children: [
                { type: "TextNode", value: "Hello " },
                { type: "TextNode", value: "World" }
            ]
        };
        assert.equal(new CodeGenerator().generate(ast)({}), "Hello World");
    });

    test("generate() should interpolate ExpressionNode values from data", () => {
        const ast = {
            type: "Root",
            children: [
                { type: "TextNode", value: "Hello " },
                { type: "ExpressionNode", expression: "name" },
                { type: "TextNode", value: "!" }
            ]
        };
        assert.equal(new CodeGenerator().generate(ast)({ name: "Ashir" }), "Hello Ashir!");
    });

    test("generate() should support dot-notation data lookup (user.name)", () => {
        const ast = {
            type: "Root",
            children: [{ type: "ExpressionNode", expression: "user.name" }]
        };
        assert.equal(new CodeGenerator().generate(ast)({ user: { name: "Waseem" } }), "Waseem");
    });

    test("generate() should render empty string for missing data keys", () => {
        const ast = {
            type: "Root",
            children: [{ type: "ExpressionNode", expression: "missing" }]
        };
        assert.equal(new CodeGenerator().generate(ast)({}), "");
    });

    test("generate() should coerce numbers to string", () => {
        const ast = {
            type: "Root",
            children: [{ type: "ExpressionNode", expression: "age" }]
        };
        assert.equal(new CodeGenerator().generate(ast)({ age: 20 }), "20");
    });

    // ---- IfNode ----

    test("renderNode(IfNode) should render consequent when condition is truthy", () => {
        const node = {
            type: "IfNode",
            condition: "user",
            consequent: [{ type: "TextNode", value: "Hello" }],
            alternate: null
        };
        assert.equal(CodeGenerator.renderNode(node, { user: true }), "Hello");
        assert.equal(CodeGenerator.renderNode(node, { user: { name: "x" } }), "Hello");
    });

    test("renderNode(IfNode) should render empty string when condition is falsy", () => {
        const node = {
            type: "IfNode",
            condition: "user",
            consequent: [{ type: "TextNode", value: "Hello" }],
            alternate: null
        };
        assert.equal(CodeGenerator.renderNode(node, { user: false }), "");
        assert.equal(CodeGenerator.renderNode(node, { user: null }), "");
        assert.equal(CodeGenerator.renderNode(node, {}), ""); // missing key → undefined → falsy
    });

    test("renderNode(IfNode) should render expressions inside consequent", () => {
        const node = {
            type: "IfNode",
            condition: "user",
            consequent: [
                { type: "TextNode", value: "Welcome " },
                { type: "ExpressionNode", expression: "user.name" }
            ],
            alternate: null
        };
        assert.equal(
            CodeGenerator.renderNode(node, { user: { name: "Waseem" } }),
            "Welcome Waseem"
        );
    });

    test("compiler should support @if / @elseif / @else conditional branches", () => {
        const source = "@if(a)A@elseif(b)B@else C@endif";
        const compiled = new Compiler().compile({ source });

        assert.equal(compiled.render({ a: true, b: false }), "A");
        assert.equal(compiled.render({ a: false, b: true }), "B");
        assert.equal(compiled.render({ a: false, b: false }), " C");
    });

    test("renderNode(ForNode) should render body once per array item with fresh scope", () => {
        const node = {
            type: "ForNode",
            iterable: "users",
            itemName: "user",
            indexName: null,
            body: [{ type: "ExpressionNode", expression: "user.name" }]
        };
        const result = CodeGenerator.renderNode(node, { users: [{ name: "A" }, { name: "B" }] });
        assert.equal(result, "AB");
    });

    test("renderNode(ForNode) should expose indexName when provided", () => {
        const node = {
            type: "ForNode",
            iterable: "users",
            itemName: "user",
            indexName: "i",
            body: [{ type: "ExpressionNode", expression: "i" }]
        };
        assert.equal(CodeGenerator.renderNode(node, { users: ["a", "b", "c"] }), "012");
    });

    test("renderNode(ForNode) should not leak loop variables into outer scope", () => {
        const node = {
            type: "ForNode",
            iterable: "users",
            itemName: "name",
            indexName: null,
            body: [{ type: "ExpressionNode", expression: "name" }]
        };
        const data = { name: "Outer", users: ["Inner"] };
        CodeGenerator.renderNode(node, data);
        assert.equal(data.name, "Outer"); // original object untouched
    });

    test("renderNode(ForNode) should throw ViewError for non-array iterable (strict mode)", () => {
        const node = { type: "ForNode", iterable: "users", itemName: "user", indexName: null, body: [] };
        assert.throws(() => CodeGenerator.renderNode(node, { users: undefined }), ViewError);
        assert.throws(() => CodeGenerator.renderNode(node, {}), ViewError);
    });

    test("@for with bare @break stops the loop entirely", () => {
        const source = "@for(users as user){{ user }}@break{{ user }}@endfor";
        const compiled = new Compiler().compile({ source });
        assert.equal(compiled.render({ users: ["a", "b", "c"] }), "a");
    });

    test("@for with @break(condition) only stops when condition is truthy", () => {
        const source = "@for(users as user)@break(user.stop){{ user.name }}@endfor";
        const compiled = new Compiler().compile({ source });
        assert.equal(compiled.render({ users: [{ name: "a" }, { name: "b", stop: true }, { name: "c" }] }), "a");
    });

    test("@for with @continue skips the rest of that iteration only", () => {
        const source = "@for(users as user)@continue(user.skip){{ user.name }}@endfor";
        const compiled = new Compiler().compile({ source });
        assert.equal(compiled.render({ users: [{ name: "a" }, { name: "b", skip: true }, { name: "c" }] }), "ac");
    });

    test("@break/@continue inside a nested @if inside @for works", () => {
        const source = "@for(users as user)@if(user.stop)@break@endif{{ user.name }}@endfor";
        const compiled = new Compiler().compile({ source });
        const data = { users: [{ name: "a" }, { name: "b", stop: true }, { name: "c" }] };
        assert.equal(compiled.render(data), "a");
    });

    test("@break/@continue in the outer body only affects the nearest (inner) @for", () => {
        const source =
            "@for(rows as row)" +
            "@for(row.cols as col)" +
            "@break(col.stop)" +
            "{{ col.name }}" +
            "@endfor" +
            "|" +
            "@endfor";
        const compiled = new Compiler().compile({ source });
        const data = {
            rows: [
                { cols: [{ name: "a" }, { name: "x", stop: true }, { name: "b" }] },
                { cols: [{ name: "c" }, { name: "d" }] }
            ]
        };
        assert.equal(compiled.render(data), "a|cd|");
    });

    test("@break outside of any @for throws ViewError", () => {
        const compiled = new Compiler().compile({ source: "@break" });
        assert.throws(() => compiled.render({}), ViewError);
    });

    test("@continue outside of any @for throws ViewError", () => {
        const compiled = new Compiler().compile({ source: "hello @continue world" });
        assert.throws(() => compiled.render({}), ViewError);
    });

    test("@continue stops subsequent sibling nodes in that iteration, next iteration renders normally", () => {
        const source = "@for(users as user){{ user.name }}@continue(user.skip)ABC@endfor";
        const compiled = new Compiler().compile({ source });
        const data = { users: [{ name: "a" }, { name: "b", skip: true }, { name: "c" }] };
        assert.equal(compiled.render(data), "aABCbcABC");
    });

    test("nested @for with inner @continue does not interrupt outer loop iteration body", () => {
        const source =
            "@for(rows as row)" +
            "@for(row.cols as col)" +
            "@continue(col.skip)" +
            "{{ col.name }}" +
            "@endfor" +
            "|" +
            "@endfor";
        const compiled = new Compiler().compile({ source });
        const data = {
            rows: [
                { cols: [{ name: "a" }, { name: "b", skip: true }, { name: "c" }] }
            ]
        };
        assert.equal(compiled.render(data), "ac|");
    });

    test("@for with circular object iterable throws ViewError safely", () => {
        const circular = {};
        circular.self = circular;
        const node = { type: "ForNode", iterable: "circular", itemName: "x", indexName: null, body: [] };
        assert.throws(() => CodeGenerator.renderNode(node, { circular }), ViewError);
    });
});
