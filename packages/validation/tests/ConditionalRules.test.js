import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Validator from "../src/Validator.js";

describe("Phase 3 Conditional Rules", () => {
    test("validates required_if when condition is met", async () => {
        const validator = new Validator();
        
        // Condition met -> role is Admin -> reason is required
        const invalidData = { role: "Admin", reason: "" };
        const rules = { reason: "required_if:role,Admin" };

        const result1 = await validator.validate(invalidData, rules);
        assert.equal(result1.fails(), true);
        assert.equal(result1.errors().has("reason"), true);

        // Condition met -> reason provided -> passes
        const validData = { role: "Admin", reason: "Maintenance access" };
        const result2 = await validator.validate(validData, rules);
        assert.equal(result2.isValid(), true);

        // Condition not met -> role is User -> reason not required even if empty
        const skippedData = { role: "User", reason: "" };
        const result3 = await validator.validate(skippedData, rules);
        assert.equal(result3.isValid(), true);
    });

    test("validates required_unless", async () => {
        const validator = new Validator();
        const rules = { taxId: "required_unless:country,US" };

        // Country is EU (not US) -> taxId required -> fails if missing
        const res1 = await validator.validate({ country: "EU" }, rules);
        assert.equal(res1.fails(), true);

        // Country is US -> taxId optional
        const res2 = await validator.validate({ country: "US" }, rules);
        assert.equal(res2.isValid(), true);
    });

    test("validates sometimes rule", async () => {
        const validator = new Validator();
        const rules = { bio: "sometimes|string|min:10" };

        // Field missing -> skipped completely
        const res1 = await validator.validate({ name: "John" }, rules);
        assert.equal(res1.isValid(), true);
        assert.equal(res1.validated().bio, undefined);

        // Field present but too short -> fails
        const res2 = await validator.validate({ bio: "short" }, rules);
        assert.equal(res2.fails(), true);

        // Field present and valid -> passes
        const res3 = await validator.validate({ bio: "Long enough user biography text" }, rules);
        assert.equal(res3.isValid(), true);
        assert.equal(res3.validated().bio, "Long enough user biography text");
    });

    test("validates exclude_if rule", async () => {
        const validator = new Validator();
        const rules = {
            hasCoupon: "boolean",
            couponCode: "exclude_if:hasCoupon,false|string"
        };

        const data = { hasCoupon: "false", couponCode: "SUMMER2026" };
        const res = await validator.validate(data, rules);

        assert.equal(res.isValid(), true);
        assert.equal(res.validated().couponCode, undefined);
    });
});
