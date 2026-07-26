import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Lexer from "../../src/compiler/Lexer.js";
import ViewError from "../../src/errors/ViewError.js";

describe("Lexer", () => {
    test("lex() should throw ViewError for non-string input", () => {
        assert.throws(() => new Lexer().lex(123), ViewError);
        assert.throws(() => new Lexer().lex(null), ViewError);
        assert.throws(() => new Lexer().lex(undefined), ViewError);
    });

    test("lex() should return [] for empty source", () => {
        assert.deepEqual(new Lexer().lex(""), []);
    });

    test("lex() should return a single Text token for plain HTML (no expressions)", () => {
        const tokens = new Lexer().lex("<h1>Hello</h1>");
        assert.equal(tokens.length, 1);
        assert.equal(tokens[0].type, "Text");
        assert.equal(tokens[0].value, "<h1>Hello</h1>");
        assert.equal(tokens[0].start, 0);
        assert.equal(tokens[0].end, 14);
        assert.equal(tokens[0].line, 1);
        assert.equal(tokens[0].column, 1);
    });

    test("lex() should tokenize {{ name }} into Text + Expression + Text", () => {
        const tokens = new Lexer().lex("Hello {{ name }}!");
        assert.equal(tokens.length, 3);
        assert.equal(tokens[0].type, "Text");
        assert.equal(tokens[0].value, "Hello ");
        assert.equal(tokens[1].type, "Expression");
        assert.equal(tokens[1].value, "name");
        assert.equal(tokens[2].type, "Text");
        assert.equal(tokens[2].value, "!");
    });

    test("lex() should trim whitespace from inside expressions", () => {
        const tokens = new Lexer().lex("{{  user.name  }}");
        assert.equal(tokens.length, 1);
        assert.equal(tokens[0].type, "Expression");
        assert.equal(tokens[0].value, "user.name");
    });

    test("lex() should handle multiple expressions in one source", () => {
        const tokens = new Lexer().lex("{{ a }}, {{ b }}, {{ c }}");
        assert.equal(tokens.length, 5); // expr, text, expr, text, expr
        assert.equal(tokens[0].value, "a");
        assert.equal(tokens[2].value, "b");
        assert.equal(tokens[4].value, "c");
    });

    test("lex() should throw ViewError for an empty expression {{ }}", () => {
        assert.throws(() => new Lexer().lex("Hello {{  }} world"), ViewError);
    });

    // ---- @if / @endif ----

    test("lex() should produce an IfOpen token from @if(condition)", () => {
        const tokens = new Lexer().lex("@if(user)");
        assert.equal(tokens.length, 1);
        assert.equal(tokens[0].type, "IfOpen");
        assert.equal(tokens[0].value, "user");
    });

    test("lex() should produce an IfClose token from @endif", () => {
        const tokens = new Lexer().lex("@endif");
        assert.equal(tokens.length, 1);
        assert.equal(tokens[0].type, "IfClose");
        assert.equal(tokens[0].value, null);
    });

    test("lex() should trim condition whitespace in @if( isAdmin )", () => {
        const tokens = new Lexer().lex("@if( isAdmin )");
        assert.equal(tokens[0].type, "IfOpen");
        assert.equal(tokens[0].value, "isAdmin");
    });

    test("lex() should tokenize a full @if block: IfOpen + Text + IfClose", () => {
        const tokens = new Lexer().lex("@if(user)\nHello\n@endif");
        assert.equal(tokens.length, 3);
        assert.equal(tokens[0].type, "IfOpen");
        assert.equal(tokens[0].value, "user");
        assert.equal(tokens[1].type, "Text");
        assert.equal(tokens[1].value, "\nHello\n");
        assert.equal(tokens[2].type, "IfClose");
    });

    test("lex() should tokenize @if with embedded expression", () => {
        const tokens = new Lexer().lex("@if(name)<p>{{ name }}</p>@endif");
        // IfOpen, Text("<p>"), Expression("name"), Text("</p>"), IfClose
        assert.equal(tokens.length, 5);
        assert.equal(tokens[0].type, "IfOpen");
        assert.equal(tokens[1].type, "Text");
        assert.equal(tokens[2].type, "Expression");
        assert.equal(tokens[3].type, "Text");
        assert.equal(tokens[4].type, "IfClose");
    });

    test("lex() should throw ViewError for empty @if condition @if()", () => {
        assert.throws(() => new Lexer().lex("@if()content@endif"), ViewError);
    });

    test("lex() should tokenize @for(items as item) into ForOpen/ForClose", () => {
        const tokens = new Lexer().lex("@for(users as user)Hi@endfor");
        assert.equal(tokens[0].type, "ForOpen");
        assert.deepEqual(tokens[0].value, { iterable: "users", itemName: "user", indexName: null });
        assert.equal(tokens[2].type, "ForClose");
    });

    test("lex() should parse index from @for(items as item, index)", () => {
        const tokens = new Lexer().lex("@for(users as user, i)@endfor");
        assert.deepEqual(tokens[0].value, { iterable: "users", itemName: "user", indexName: "i" });
    });

    test("lex() should treat @foreach/@endforeach as the same ForOpen/ForClose tokens", () => {
        const tokens = new Lexer().lex("@foreach(users as user)@endforeach");
        assert.equal(tokens[0].type, "ForOpen");
        assert.equal(tokens[1].type, "ForClose");
    });

    test("lex() should throw ViewError for malformed @for expression", () => {
        assert.throws(() => new Lexer().lex("@for(users)content@endfor"), ViewError);
    });

    test("lex() should tokenize bare @break and @continue", () => {
        const breakTokens = new Lexer().lex("@break");
        assert.equal(breakTokens[0].type, "Break");
        assert.equal(breakTokens[0].value, null);

        const continueTokens = new Lexer().lex("@continue");
        assert.equal(continueTokens[0].type, "Continue");
        assert.equal(continueTokens[0].value, null);
    });

    test("lex() should tokenize @break(condition) / @continue(condition)", () => {
        assert.equal(new Lexer().lex("@break(user.isLast)")[0].value, "user.isLast");
        assert.equal(new Lexer().lex("@continue(!user.active)")[0].value, "!user.active");
    });

    test("lex() should throw ViewError for @break()/@continue() with empty parens", () => {
        assert.throws(() => new Lexer().lex("@break()"), ViewError);
        assert.throws(() => new Lexer().lex("@continue()"), ViewError);
    });
});
