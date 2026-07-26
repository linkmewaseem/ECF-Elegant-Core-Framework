import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Compiler from "../src/Compiler.js";
import CompiledTemplate from "../src/CompiledTemplate.js";

describe("Compiler", () => {
    test("compile() should return a frozen CompiledTemplate instance", () => {
        const compiled = new Compiler().compile({ name: "home", source: "<h1>Hello</h1>" });

        assert.ok(compiled instanceof CompiledTemplate);
        assert.equal(compiled.render({}), "<h1>Hello</h1>");
        assert.throws(() => { compiled.ast.children[0].value = "hacked"; }, TypeError);
    });

    test("analyze() should expose tokens, ast, and hash before finalizing", () => {
        const compilation = new Compiler().analyze({ name: "home", source: "<h1>Hello</h1>" });

        assert.equal(compilation.tokens.length, 1);
        assert.equal(compilation.tokens[0].type, "Text");
        assert.equal(compilation.ast.type, "Root");
        assert.equal(typeof compilation.hash, "string");
    });

    test("hash should change when source changes", () => {
        const compiler = new Compiler();
        const a = compiler.compile({ source: "A" }).hash;
        const b = compiler.compile({ source: "B" }).hash;
        assert.notEqual(a, b);
    });

    test("end-to-end: {{ name }} and {{ age }} should render from data", () => {
        const source = "<p>{{ name }}</p><p>{{ age }}</p>";
        const compiled = new Compiler().compile({ name: "home", source });
        const html = compiled.render({ name: "Ashir Awan", age: 20 });
        assert.equal(html, "<p>Ashir Awan</p><p>20</p>");
    });

    test("end-to-end: template with no expressions renders as static HTML", () => {
        const source = "<h1>Welcome</h1>";
        const compiled = new Compiler().compile({ name: "home", source });
        assert.equal(compiled.render({}), "<h1>Welcome</h1>");
    });

    test("end-to-end: empty source produces empty render output", () => {
        const compiled = new Compiler().compile({ name: "empty", source: "" });
        assert.equal(compiled.render({}), "");
    });

    // ---- @if end-to-end ----

    test("end-to-end: @if renders consequent when condition is truthy", () => {
        const source = "@if(user)<h1>Welcome {{ user.name }}</h1>@endif";
        const compiled = new Compiler().compile({ name: "home", source });
        const html = compiled.render({ user: { name: "Waseem" } });
        assert.equal(html, "<h1>Welcome Waseem</h1>");
    });

    test("end-to-end: @if renders nothing when condition is falsy", () => {
        const source = "@if(user)<h1>Welcome</h1>@endif";
        const compiled = new Compiler().compile({ name: "home", source });
        assert.equal(compiled.render({ user: null }), "");
        assert.equal(compiled.render({}), "");
        assert.equal(compiled.render({ user: false }), "");
    });

    test("end-to-end: @if inside surrounding text", () => {
        const source = "Before@if(show) Middle @endif After";
        const compiled = new Compiler().compile({ name: "test", source });
        // " Middle " is inside the block; " After" is outside → "Before Middle  After"
        assert.equal(compiled.render({ show: true }), "Before Middle  After");
        assert.equal(compiled.render({ show: false }), "Before After");
    });

    test("end-to-end: nested @if", () => {
        const source = "@if(user)@if(admin)ADMIN@endif@endif";
        const compiled = new Compiler().compile({ name: "test", source });
        assert.equal(compiled.render({ user: true, admin: true }), "ADMIN");
        assert.equal(compiled.render({ user: true, admin: false }), "");
        assert.equal(compiled.render({ user: false, admin: true }), "");
    });

    test("end-to-end: @if with dot-notation condition is truthy for objects", () => {
        const source = "@if(user.isAdmin)Admin Panel@endif";
        const compiled = new Compiler().compile({ name: "test", source });
        assert.equal(compiled.render({ user: { isAdmin: true } }), "Admin Panel");
        assert.equal(compiled.render({ user: { isAdmin: false } }), "");
    });
});
