import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Lexer from "../../src/compiler/Lexer.js";
import Parser from "../../src/compiler/Parser.js";
import CodeGenerator from "../../src/compiler/CodeGenerator.js";
import ViewError from "../../src/errors/ViewError.js";

let hasSwitchSupport = false;
try {
    await import("../../src/ast/SwitchNode.js");
    hasSwitchSupport = true;
} catch {
    // Phase 1 pending feature
}

function render(source, data = {}) {
    const tokens = new Lexer().lex(source);
    const ast = new Parser().parse(tokens);
    const renderFn = new CodeGenerator().generate(ast);
    return renderFn(data);
}

describe("@switch / @case / @default", { skip: !hasSwitchSupport }, () => {
    test("simple switch renders the matching case", () => {
        const source = `@switch(role)@case("admin")Admin@endswitch`;
        assert.equal(render(source, { role: "admin" }), "Admin");
    });

    test("multiple cases — renders whichever one matches", () => {
        const source = `@switch(role)@case("admin")Admin@case("editor")Editor@endswitch`;
        assert.equal(render(source, { role: "editor" }), "Editor");
    });

    test("falls back to @default when nothing matches", () => {
        const source = `@switch(role)@case("admin")Admin@default User@endswitch`;
        assert.equal(render(source, { role: "guest" }), " User");
    });

    test("no @default and no match renders empty string", () => {
        const source = `@switch(role)@case("admin")Admin@endswitch`;
        assert.equal(render(source, { role: "guest" }), "");
    });

    test("first match only — no implicit fall-through between cases", () => {
        const source = `@switch(role)@case("admin")A@case("editor")B@endswitch`;
        assert.equal(render(source, { role: "admin" }), "A");
    });

    test("empty switch (no cases, no default) renders empty string", () => {
        const source = `@switch(role)@endswitch`;
        assert.equal(render(source, { role: "anything" }), "");
    });

    test("duplicate @case throws a compile-time ViewError", () => {
        const source = `@switch(role)@case("admin")A@case("admin")B@endswitch`;
        assert.throws(() => render(source), ViewError);
    });

    test("duplicate @default throws a compile-time ViewError", () => {
        const source = `@switch(role)@default A@default B@endswitch`;
        assert.throws(() => render(source), ViewError);
    });

    test("missing @endswitch throws a ViewError", () => {
        const source = `@switch(role)@case("admin")Admin`;
        assert.throws(() => render(source), ViewError);
    });

    test("orphan @case (no enclosing @switch) throws a ViewError", () => {
        const source = `@case("admin")Admin`;
        assert.throws(() => render(source), ViewError);
    });

    test("orphan @default (no enclosing @switch) throws a ViewError", () => {
        const source = `@default Admin`;
        assert.throws(() => render(source), ViewError);
    });

    test("nested switch — inner switch resolves independently", () => {
        const source =
            `@switch(a)@case(1)` +
            `@switch(b)@case(2)Inner@endswitch` +
            `@endswitch`;
        assert.equal(render(source, { a: 1, b: 2 }), "Inner");
    });

    test("nested @if inside a @case body", () => {
        const source = `@switch(role)@case("admin")@if(active)Active Admin@endif@endswitch`;
        assert.equal(render(source, { role: "admin", active: true }), "Active Admin");
    });

    test("nested @for inside a @case body", () => {
        const source = `@switch(role)@case("admin")@for(items as item){{ item }}@endfor@endswitch`;
        assert.equal(render(source, { role: "admin", items: [1, 2, 3] }), "123");
    });

    test("@switch inside @for — renders per iteration", () => {
        const source = `@for(items as item)@switch(item.type)@case("x")X@case("y")Y@endswitch@endfor`;
        const data = { items: [{ type: "x" }, { type: "y" }, { type: "z" }] };
        assert.equal(render(source, data), "XY");
    });
});

describe("nearestLoop vs nearestBreakable — @break and @continue targeting", { skip: !hasSwitchSupport }, () => {
    test("@break inside @switch exits only the switch (not an enclosing @for)", () => {
        const source =
            `@for(items as item)` +
            `@switch(item)@case(1)@break@endswitch` +
            `After` +
            `@endfor`;
        // The @break should stop rendering inside the switch case, but the
        // @for must keep iterating — "After" should print for every item.
        assert.equal(render(source, { items: [1, 2, 3] }), "AfterAfterAfter");
    });

    test("conditional @break truncates a case body without touching the switch's own default flow", () => {
        const source =
            `@switch(role)` +
            `@case("admin")Hello @if(hide)@break@endif World@endswitch`;
        assert.equal(render(source, { role: "admin", hide: true }), "Hello ");
        assert.equal(render(source, { role: "admin", hide: false }), "Hello  World");
    });

    test("@break inside nested @for exits only the inner loop", () => {
        const source =
            `@for(outer as o)` +
            `@for(inner as i){{ i }}@if(i2)@break@endif@endfor` +
            `|` +
            `@endfor`;
        const data = { outer: [1, 2], inner: [1, 2, 3], i2: false };
        // inner loop fully completes each time since i2 is false
        assert.equal(render(source, data), "123|123|");
    });

    test("@break inside nested @switch exits only the inner switch", () => {
        const source =
            `@switch(a)@case(1)` +
            `Outer-Before ` +
            `@switch(b)@case(2)Inner @break Unreached@endswitch` +
            ` Outer-After` +
            `@endswitch`;
        assert.equal(render(source, { a: 1, b: 2 }), "Outer-Before Inner  Outer-After");
    });

    test("@continue inside @switch inside @for continues the OUTER loop, not the switch", () => {
        const source =
            `@for(items as item)` +
            `@switch(item.type)@case("skip")@continue@endswitch` +
            `{{ item.name }}|` +
            `@endfor`;
        const data = {
            items: [
                { type: "skip", name: "A" },
                { type: "keep", name: "B" },
                { type: "skip", name: "C" },
                { type: "keep", name: "D" }
            ]
        };
        // "A" and "C" are skipped entirely (continue fires before the name prints);
        // the loop itself must NOT stop — B and D still render.
        assert.equal(render(source, data), "B|D|");
    });

    test("@continue inside @switch with NO enclosing @for throws ViewError", () => {
        const source = `@switch(role)@case("admin")@continue@endswitch`;
        assert.throws(() => render(source, { role: "admin" }), ViewError);
    });

    test("@break outside both @switch and @for throws ViewError", () => {
        const source = `Text @break`;
        assert.throws(() => render(source), ViewError);
    });

    test("@continue outside @for throws ViewError even with an enclosing @switch elsewhere", () => {
        const source = `@switch(a)@case(1)ok@endswitch @continue`;
        assert.throws(() => render(source, { a: 1 }), ViewError);
    });

    test("nested @for inside @switch — @break targets the innermost @for, not the switch", () => {
        const source =
            `@switch(a)@case(1)` +
            `@for(items as item){{ item }}@if(item2)@break@endif@endfor` +
            `AfterFor` +
            `@endswitch`;
        const data = { a: 1, items: [1, 2, 3], item2: false };
        assert.equal(render(source, data), "123AfterFor");
    });
});
