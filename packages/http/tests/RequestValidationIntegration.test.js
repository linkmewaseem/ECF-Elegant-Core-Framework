import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";

import Request from "../src/Request.js";
import ValidationException from "../src/exceptions/ValidationException.js";

function makeFakeIncomingMessage({ method = "POST", url = "/register", headers = {} } = {}) {
    const stream = new Readable({ read() {} });
    stream.method = method;
    stream.url = url;
    stream.headers = headers;
    return stream;
}

function makeFakeBodyParserManager(parsedBody = {}) {
    return {
        parse: async () => parsedBody
    };
}

describe("Request.validate() Integration in @ecfjs/http", () => {
    test("returns validated input data when rules pass", async () => {
        const bpm = makeFakeBodyParserManager({ email: "user@example.com", name: "Waseem", unwanted: "x" });
        const req = new Request(makeFakeIncomingMessage(), bpm);

        const validated = await req.validate({
            email: "required|email",
            name: "required|string"
        });

        assert.deepEqual(validated, {
            email: "user@example.com",
            name: "Waseem"
        });
    });

    test("throws ValidationException (422) when rules fail", async () => {
        const bpm = makeFakeBodyParserManager({ email: "bad-email" });
        const req = new Request(makeFakeIncomingMessage(), bpm);

        try {
            await req.validate({
                email: "required|email",
                password: "required"
            });
            assert.fail("should have thrown ValidationException");
        } catch (error) {
            assert.ok(error instanceof ValidationException);
            assert.equal(error.statusCode, 422);
            assert.equal(typeof error.errors.email, "object");
            assert.equal(typeof error.errors.password, "object");
        }
    });
});
