import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Validator, Rule } from "../src/index.js";

describe("Fluent Rule Objects & Builder API", () => {
    test("validates rules using Rule static factory builder methods", async () => {
        const validator = new Validator();
        const data = {
            username: "waseem_developer",
            email: "waseem@ecf.dev",
            age: 28,
            role: "admin"
        };

        const rules = {
            username: [Rule.required(), Rule.alphaDash(), Rule.min(4)],
            email: [Rule.required(), Rule.email()],
            age: [Rule.required(), Rule.integer(), Rule.between(18, 99)],
            role: [Rule.required(), Rule.in(["admin", "user", "guest"])]
        };

        const result = await validator.validate(data, rules);

        assert.equal(result.isValid(), true);
        assert.deepEqual(result.validated(), data);
    });

    test("fails when fluent Rule objects constraints are violated", async () => {
        const validator = new Validator();
        const data = {
            username: "a!",
            email: "not-an-email",
            age: 12,
            role: "superadmin"
        };

        const rules = {
            username: [Rule.required(), Rule.alphaDash(), Rule.min(3)],
            email: [Rule.required(), Rule.email()],
            age: [Rule.integer(), Rule.between(18, 99)],
            role: [Rule.in(["admin", "user"])]
        };

        const result = await validator.validate(data, rules);

        assert.equal(result.fails(), true);
        assert.equal(result.errors().has("username"), true);
        assert.equal(result.errors().has("email"), true);
        assert.equal(result.errors().has("age"), true);
        assert.equal(result.errors().has("role"), true);
    });
});
