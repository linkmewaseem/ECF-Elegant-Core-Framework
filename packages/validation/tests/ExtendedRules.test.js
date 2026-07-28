import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Validator from "../src/Validator.js";

describe("Phase 2 Extended Rules", () => {
    test("validates date, url, uuid, json, ip", async () => {
        const validator = new Validator();
        const data = {
            dob: "2026-07-28",
            website: "https://google.com",
            id: "123e4567-e89b-12d3-a456-426614174000",
            payload: '{"key":"value"}',
            ip: "192.168.1.1"
        };

        const rules = {
            dob: "required|date",
            website: "required|url",
            id: "required|uuid",
            payload: "required|json",
            ip: "required|ip:v4"
        };

        const result = await validator.validate(data, rules);
        assert.equal(result.isValid(), true);
    });

    test("fails on invalid date, url, uuid, json, ip", async () => {
        const validator = new Validator();
        const data = {
            dob: "invalid-date",
            website: "ftp://google.com",
            id: "invalid-uuid",
            payload: "{invalid-json}",
            ip: "999.999.999.999"
        };

        const rules = {
            dob: "date",
            website: "url",
            id: "uuid",
            payload: "json",
            ip: "ipv4"
        };

        const result = await validator.validate(data, rules);
        assert.equal(result.fails(), true);
        assert.equal(result.errors().has("dob"), true);
        assert.equal(result.errors().has("website"), true);
        assert.equal(result.errors().has("id"), true);
        assert.equal(result.errors().has("payload"), true);
        assert.equal(result.errors().has("ip"), true);
    });

    test("validates alpha, alphanum, alphadash", async () => {
        const validator = new Validator();
        const data = {
            name: "Waseem",
            code: "Alpha123",
            slug: "my-first_post"
        };

        const rules = {
            name: "alpha",
            code: "alphanum",
            slug: "alphadash"
        };

        const result = await validator.validate(data, rules);
        assert.equal(result.isValid(), true);
    });

    test("validates same, different, between, digits, startsWith, endsWith, contains", async () => {
        const validator = new Validator();
        const data = {
            pass: "secret123",
            passConfirm: "secret123",
            oldPass: "oldsecret",
            score: 75,
            pin: "1234",
            phone: "+923001234567",
            tag: "ECF-ENTERPRISE-FRAMEWORK"
        };

        const rules = {
            passConfirm: "same:pass",
            oldPass: "different:pass",
            score: "between:50,100",
            pin: "digits:4",
            phone: "startswith:+92",
            tag: "endswith:FRAMEWORK|contains:ENTERPRISE"
        };

        const result = await validator.validate(data, rules);
        assert.equal(result.isValid(), true);
    });

    test("fails on same mismatch and between range violation", async () => {
        const validator = new Validator();
        const data = {
            pass: "secret123",
            passConfirm: "differentSecret",
            score: 150
        };

        const rules = {
            passConfirm: "same:pass",
            score: "between:1,100"
        };

        const result = await validator.validate(data, rules);
        assert.equal(result.fails(), true);
        assert.equal(result.errors().has("passConfirm"), true);
        assert.equal(result.errors().has("score"), true);
    });
});
