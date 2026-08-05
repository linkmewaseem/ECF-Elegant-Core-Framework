import { describe, test } from "node:test";
import assert from "node:assert/strict";
import HttpExceptionHandler from "../src/HttpExceptionHandler.js";
import HttpExceptionHandlerError from "../src/errors/HttpExceptionHandlerError.js";
import { ExceptionManager } from "@ecfjs/core";

function makeFakeResponse() {
    const calls = { statusCode: null, body: null };
    return {
        calls,
        status(code) { calls.statusCode = code; return this; },
        text(body) { calls.body = body; return this; },
        json(body) { calls.body = JSON.stringify(body); return this; }
    };
}

describe("HttpExceptionHandler - constructor", () => {

    test("should throw if exceptionManager is invalid", () => {
        assert.throws(() => new HttpExceptionHandler(null), HttpExceptionHandlerError);
        assert.throws(() => new HttpExceptionHandler({}), HttpExceptionHandlerError);
    });

    test("should NOT register any default mappings on construction", () => {
        const manager = new ExceptionManager();
        new HttpExceptionHandler(manager);

        assert.equal(manager.resolveRenderer(new Error("x")), null);
    });

});

describe("HttpExceptionHandler - handle()", () => {

    test("should use a registered renderer when available", () => {
        const manager = new ExceptionManager();
        class CustomError extends Error {}

        manager.render(CustomError, (err, req, res) => res.status(422).text("custom"));

        const handler = new HttpExceptionHandler(manager);
        const res = makeFakeResponse();

        handler.handle(new CustomError("x"), {}, res);

        assert.equal(res.calls.statusCode, 422);
        assert.equal(res.calls.body, "custom");
    });

    test("should fall back to 500 when no renderer is registered", () => {
        const manager = new ExceptionManager();
        const handler = new HttpExceptionHandler(manager);
        const res = makeFakeResponse();

        handler.handle(new Error("boom"), {}, res);

        assert.equal(res.calls.statusCode, 500);
    });

    test("should call a registered reporter without affecting the response", () => {
        const manager = new ExceptionManager();
        let reported = null;

        manager.report(Error, (err) => { reported = err; });

        const handler = new HttpExceptionHandler(manager);
        const res = makeFakeResponse();
        const error = new Error("boom");

        handler.handle(error, {}, res);

        assert.strictEqual(reported, error);
        assert.equal(res.calls.statusCode, 500);
    });

});
