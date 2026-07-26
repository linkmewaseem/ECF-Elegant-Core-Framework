import { describe, test } from "node:test";
import assert from "node:assert/strict";
import ExpressionEngine from "../../src/expression/ExpressionEngine.js";

describe("Expression Evaluator", () => {
    const engine = new ExpressionEngine();

    test("evaluates arithmetic expressions", () => {
        assert.equal(engine.evaluate("10 + 5 * 2"), 20);
        assert.equal(engine.evaluate("(10 + 5) * 2"), 30);
        assert.equal(engine.evaluate("100 / 4 - 5"), 20);
        assert.equal(engine.evaluate("10 % 3"), 1);
    });

    test("evaluates member access and scope data", () => {
        const scope = { user: { name: "Alice", age: 25, role: "Admin" } };
        assert.equal(engine.evaluate("user.name", scope), "Alice");
        assert.equal(engine.evaluate("user.age >= 18", scope), true);
        assert.equal(engine.evaluate("user.role === 'Admin'", scope), true);
        assert.equal(engine.evaluate("user.role === 'Manager'", scope), false);
    });

    test("evaluates logical operators and nullish coalescing", () => {
        const scope = { name: null, defaultName: "Guest", count: 0 };
        assert.equal(engine.evaluate("name ?? defaultName", scope), "Guest");
        assert.equal(engine.evaluate("count ?? 10", scope), 0);
        assert.equal(engine.evaluate("true && 'OK'", scope), "OK");
        assert.equal(engine.evaluate("false || 'Fallback'", scope), "Fallback");
    });

    test("evaluates optional chaining", () => {
        const scope = { user: null, activeUser: { profile: { email: "test@example.com" } } };
        assert.equal(engine.evaluate("user?.profile?.email", scope), undefined);
        assert.equal(engine.evaluate("activeUser?.profile?.email", scope), "test@example.com");
    });

    test("evaluates ternary expressions", () => {
        const scope = { isMember: true, points: 150 };
        assert.equal(engine.evaluate("isMember ? 'VIP' : 'Standard'", scope), "VIP");
        assert.equal(engine.evaluate("points > 100 ? 'Gold' : 'Silver'", scope), "Gold");
    });

    test("evaluates array expressions", () => {
        const scope = { item: "banana" };
        assert.deepEqual(engine.evaluate("['apple', item, 'cherry']", scope), ["apple", "banana", "cherry"]);
    });
});
