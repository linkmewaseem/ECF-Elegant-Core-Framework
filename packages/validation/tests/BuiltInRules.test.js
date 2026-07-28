import { describe, test } from "node:test";
import assert from "node:assert/strict";

import Required from "../src/rules/Required.js";
import EmailRule from "../src/rules/EmailRule.js";
import MinRule from "../src/rules/MinRule.js";
import MaxRule from "../src/rules/MaxRule.js";
import InRule from "../src/rules/InRule.js";
import ConfirmedRule from "../src/rules/ConfirmedRule.js";
import AcceptedRule from "../src/rules/AcceptedRule.js";
import NumberRule from "../src/rules/NumberRule.js";
import IntegerRule from "../src/rules/IntegerRule.js";
import BooleanRule from "../src/rules/BooleanRule.js";

describe("Built-in Rules Batch 1", () => {
    test("Required rule", () => {
        const r = new Required();
        assert.equal(r.validate("hello"), true);
        assert.equal(r.validate(""), false);
        assert.equal(r.validate(null), false);
        assert.equal(r.validate(undefined), false);
        assert.equal(r.validate([]), false);
        assert.equal(r.validate([1]), true);
    });

    test("EmailRule", () => {
        const r = new EmailRule();
        assert.equal(r.validate("user@example.com"), true);
        assert.equal(r.validate("invalid-email"), false);
        assert.equal(r.validate(""), true); // empty passes unless required is set
    });

    test("MinRule (string length & number value)", () => {
        const r = new MinRule();
        assert.equal(r.validate("secret", "field", {}, ["5"]), true);
        assert.equal(r.validate("cat", "field", {}, ["5"]), false);
        assert.equal(r.validate(10, "field", {}, ["5"]), true);
        assert.equal(r.validate(2, "field", {}, ["5"]), false);
    });

    test("MaxRule (string length & number value)", () => {
        const r = new MaxRule();
        assert.equal(r.validate("short", "field", {}, ["10"]), true);
        assert.equal(r.validate("superlongtext", "field", {}, ["10"]), false);
        assert.equal(r.validate(5, "field", {}, ["10"]), true);
        assert.equal(r.validate(15, "field", {}, ["10"]), false);
    });

    test("InRule", () => {
        const r = new InRule();
        assert.equal(r.validate("admin", "role", {}, ["admin", "user"]), true);
        assert.equal(r.validate("superhero", "role", {}, ["admin", "user"]), false);
    });

    test("ConfirmedRule", () => {
        const r = new ConfirmedRule();
        assert.equal(r.validate("pass123", "password", { password: "pass123", password_confirmation: "pass123" }), true);
        assert.equal(r.validate("pass123", "password", { password: "pass123", password_confirmation: "different" }), false);
    });

    test("AcceptedRule", () => {
        const r = new AcceptedRule();
        assert.equal(r.validate("true"), true);
        assert.equal(r.validate("yes"), true);
        assert.equal(r.validate(1), true);
        assert.equal(r.validate("no"), false);
    });

    test("NumberRule & IntegerRule & BooleanRule", () => {
        const num = new NumberRule();
        const intRule = new IntegerRule();
        const boolRule = new BooleanRule();

        assert.equal(num.validate("123.45"), true);
        assert.equal(num.validate("abc"), false);

        assert.equal(intRule.validate("100"), true);
        assert.equal(intRule.validate("100.5"), false);

        assert.equal(boolRule.validate(true), true);
        assert.equal(boolRule.validate("off"), true);
        assert.equal(boolRule.validate("maybe"), false);
    });
});
