import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Validator from "../src/Validator.js";

describe("Validator - Nested Fields & Array Wildcards", () => {
    test("validates nested object properties (user.profile.email)", async () => {
        const validator = new Validator();
        const data = {
            user: {
                profile: {
                    email: "invalid-email"
                }
            }
        };

        const rules = {
            "user.profile.email": "required|email"
        };

        const result = await validator.validate(data, rules);

        assert.equal(result.fails(), true);
        assert.ok(result.errors().has("user.profile.email"));
        assert.ok(result.errors().first("user.profile.email").includes("valid email"));
    });

    test("validates array wildcard elements (users.*.email)", async () => {
        const validator = new Validator();
        const data = {
            users: [
                { email: "valid@example.com" },
                { email: "bad-email" },
                { email: "another@example.com" }
            ]
        };

        const rules = {
            "users.*.email": "required|email"
        };

        const result = await validator.validate(data, rules);

        assert.equal(result.fails(), true);
        assert.equal(result.errors().has("users.0.email"), false);
        assert.equal(result.errors().has("users.1.email"), true);
        assert.equal(result.errors().has("users.2.email"), false);
    });
});
