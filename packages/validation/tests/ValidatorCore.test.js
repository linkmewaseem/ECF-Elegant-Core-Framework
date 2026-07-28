import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Validator from "../src/Validator.js";

describe("Validator Core Engine", () => {
    test("validates flat objects and returns validated data", async () => {
        const validator = new Validator();
        const data = {
            name: "Waseem",
            email: "waseem@example.com",
            age: "25",
            unwantedInput: "hack"
        };

        const rules = {
            name: "required|string|min:3",
            email: "required|email",
            age: "required|integer|min:18"
        };

        const result = await validator.validate(data, rules);

        assert.equal(result.isValid(), true);
        assert.equal(result.fails(), false);
        assert.deepEqual(result.validated(), {
            name: "Waseem",
            email: "waseem@example.com",
            age: "25"
        });
        assert.equal(result.validated().unwantedInput, undefined);
    });

    test("returns formatted error messages on validation failure", async () => {
        const validator = new Validator();
        const data = {
            email: "invalid-email",
            password: "123"
        };

        const rules = {
            email: "required|email",
            password: "required|min:8",
            name: "required"
        };

        const result = await validator.validate(data, rules);

        assert.equal(result.fails(), true);
        const errors = result.errors().all();

        assert.ok(errors.email[0].includes("valid email"));
        assert.ok(errors.password[0].includes("at least 8"));
        assert.ok(errors.name[0].includes("required"));
    });

    test("supports custom error message overrides and token replacements", async () => {
        const validator = new Validator();
        const data = { email: "" };
        const rules = { email: "required|email" };
        const messages = { "email.required": "Please type in your email address." };

        const result = await validator.validate(data, rules, messages);
        assert.equal(result.errors().first("email"), "Please type in your email address.");
    });

    test("supports extending validator with custom rules", async () => {
        const validator = new Validator();
        validator.extend("even", (val) => Number(val) % 2 === 0, "The :attribute must be an even number.");

        const res1 = await validator.validate({ num: 4 }, { num: "even" });
        assert.equal(res1.isValid(), true);

        const res2 = await validator.validate({ num: 3 }, { num: "even" });
        assert.equal(res2.fails(), true);
        assert.equal(res2.errors().first("num"), "The num must be an even number.");
    });
});
