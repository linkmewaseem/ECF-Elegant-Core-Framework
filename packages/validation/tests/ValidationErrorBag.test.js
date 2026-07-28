import { describe, test } from "node:test";
import assert from "node:assert/strict";
import ValidationErrorBag from "../src/ValidationErrorBag.js";

describe("ValidationErrorBag", () => {
    test("instantiates empty or with initial error object", () => {
        const bag1 = new ValidationErrorBag();
        assert.equal(bag1.isEmpty(), true);
        assert.equal(bag1.count(), 0);

        const bag2 = new ValidationErrorBag({ email: ["Required", "Invalid"] });
        assert.equal(bag2.isEmpty(), false);
        assert.equal(bag2.count(), 2);
    });

    test("add(), get(), first(), has(), count()", () => {
        const bag = new ValidationErrorBag();
        bag.add("email", "Email is required");
        bag.add("email", "Email must be valid");
        bag.add("password", "Password is required");

        assert.equal(bag.has("email"), true);
        assert.equal(bag.has("username"), false);
        assert.equal(bag.count(), 3);

        assert.deepEqual(bag.get("email"), ["Email is required", "Email must be valid"]);
        assert.equal(bag.first("email"), "Email is required");
        assert.equal(bag.first("password"), "Password is required");
        assert.equal(bag.first(), "Email is required");
    });

    test("all() and flat() formatting", () => {
        const bag = new ValidationErrorBag();
        bag.add("email", "Err 1");
        bag.add("password", "Err 2");

        assert.deepEqual(bag.all(), {
            email: ["Err 1"],
            password: ["Err 2"]
        });

        assert.deepEqual(bag.flat(), ["Err 1", "Err 2"]);
    });
});
