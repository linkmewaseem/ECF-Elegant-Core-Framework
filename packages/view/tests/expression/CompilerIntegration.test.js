import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Compiler from "../../src/Compiler.js";

describe("ExpressionEngine Compiler Integration", () => {
    test("renders complex @if expressions using ExpressionEngine", () => {
        const source = `
        @if(user.role === 'Admin' && user.age >= 18)
            <p>Access Granted: {{ user.name }}</p>
        @else
            <p>Access Denied</p>
        @endif
        `;

        const compiler = new Compiler();
        const template = compiler.compile({ name: "test", source });

        const output1 = template.render({ user: { name: "Ashir", role: "Admin", age: 20 } });
        assert.ok(output1.includes("Access Granted: Ashir"));

        const output2 = template.render({ user: { name: "John", role: "User", age: 20 } });
        assert.ok(output2.includes("Access Denied"));
    });

    test("renders ternary expressions and arithmetic in interpolations", () => {
        const source = `<p>{{ user.points > 100 ? 'Gold' : 'Silver' }}</p><p>Total: {{ price * qty }}</p>`;
        const compiler = new Compiler();
        const template = compiler.compile({ name: "test", source });

        const html = template.render({ user: { points: 150 }, price: 25, qty: 4 });
        assert.ok(html.includes("<p>Gold</p>"));
        assert.ok(html.includes("<p>Total: 100</p>"));
    });
});
