import { describe, test } from "node:test";
import assert from "node:assert/strict";

import ExceptionRenderer from "../src/exceptions/ExceptionRenderer.js";
import NotFoundException from "../src/exceptions/NotFoundException.js";
import ValidationException from "../src/exceptions/ValidationException.js";
import InternalServerException from "../src/exceptions/InternalServerException.js";
import Response from "../src/Response.js";

function makeFakeServerResponse() {
    const headers = new Map();
    return {
        statusCode: 200,
        headersSent: false,
        setHeader(n, v) { headers.set(n.toLowerCase(), v); },
        getHeader(n) { return headers.get(n.toLowerCase()); },
        removeHeader(n) { headers.delete(n.toLowerCase()); },
        end(data) { this.body = data; this.headersSent = true; },
        on() {}, once() {}, emit() {}, destroy() {}
    };
}

describe("ExceptionRenderer - JSON & HTML Error Formatting", () => {

    describe("JSON Content Negotiation", () => {
        test("renders JSON in Production mode (debug = false) hiding internal stack traces for 500", async () => {
            const renderer = new ExceptionRenderer(false);
            const rawRes = makeFakeServerResponse();
            const res = new Response(rawRes);
            const req = { expectsJson: () => true };

            const error = new Error("Database password leaked in stack trace!");
            await renderer.render(error, req, res);

            assert.equal(res.statusCode, 500);
            assert.equal(rawRes.getHeader("content-type"), "application/json; charset=utf-8");

            const parsed = JSON.parse(rawRes.body);
            assert.equal(parsed.statusCode, 500);
            assert.equal(parsed.message, "Server Error");
            assert.equal(parsed.stack, undefined);
        });

        test("renders JSON in Production mode keeping user-facing client messages for 404/422", async () => {
            const renderer = new ExceptionRenderer(false);
            const rawRes = makeFakeServerResponse();
            const res = new Response(rawRes);
            const req = { expectsJson: () => true };

            const error = ValidationException.withErrors({ username: ["Required"] });
            await renderer.render(error, req, res);

            assert.equal(res.statusCode, 422);

            const parsed = JSON.parse(rawRes.body);
            assert.equal(parsed.statusCode, 422);
            assert.equal(parsed.message, "The given data was invalid.");
            assert.deepEqual(parsed.errors, { username: ["Required"] });
        });

        test("renders detailed JSON in Debug mode (debug = true) with stack trace", async () => {
            const renderer = new ExceptionRenderer(true);
            const rawRes = makeFakeServerResponse();
            const res = new Response(rawRes);
            const req = { expectsJson: () => true };

            const error = new NotFoundException("User 42 not found");
            await renderer.render(error, req, res);

            assert.equal(res.statusCode, 404);

            const parsed = JSON.parse(rawRes.body);
            assert.equal(parsed.statusCode, 404);
            assert.equal(parsed.message, "User 42 not found");
            assert.equal(parsed.exception, "NotFoundException");
            assert.ok(Array.isArray(parsed.stack));
        });
    });

    describe("HTML Content Negotiation & Error Views", () => {
        test("renders Debug HTML with stack trace when debug = true", async () => {
            const renderer = new ExceptionRenderer(true);
            const rawRes = makeFakeServerResponse();
            const res = new Response(rawRes);
            const req = { expectsJson: () => false, method: "POST", url: "/checkout" };

            const error = new InternalServerException("Payment Gateway Timeout");
            await renderer.render(error, req, res);

            assert.equal(res.statusCode, 500);
            assert.equal(rawRes.getHeader("content-type"), "text/html; charset=utf-8");
            assert.ok(rawRes.body.includes("Payment Gateway Timeout"));
            assert.ok(rawRes.body.includes("Stack Trace"));
            assert.ok(rawRes.body.includes("POST /checkout"));
        });

        test("renders Production HTML card when debug = false", async () => {
            const renderer = new ExceptionRenderer(false);
            const rawRes = makeFakeServerResponse();
            const res = new Response(rawRes);
            const req = { expectsJson: () => false, method: "GET", url: "/secret" };

            const error = new NotFoundException();
            await renderer.render(error, req, res);

            assert.equal(res.statusCode, 404);
            assert.equal(rawRes.getHeader("content-type"), "text/html; charset=utf-8");
            assert.ok(rawRes.body.includes("404 | Page Not Found"));
            assert.ok(!rawRes.body.includes("Stack Trace"));
        });

        test("uses registered view engine to render custom error view (errors/404)", async () => {
            const renderer = new ExceptionRenderer(false);
            const rawRes = makeFakeServerResponse();

            let renderedViewName = null;
            const fakeViewEngine = {
                render: async (viewName, data) => {
                    renderedViewName = viewName;
                    return `<h1>Custom Error View: ${viewName}</h1>`;
                }
            };

            const res = new Response(rawRes, { view: fakeViewEngine });
            const req = { expectsJson: () => false };

            const error = new NotFoundException("Missing Document");
            await renderer.render(error, req, res);

            assert.equal(res.statusCode, 404);
            assert.equal(renderedViewName, "errors/404");
            assert.equal(rawRes.body, "<h1>Custom Error View: errors/404</h1>");
        });
    });

    describe("Custom Exception Renderers", () => {
        test("allows registering custom renderer for specific exception class", async () => {
            class CustomBusinessError extends Error {}

            const renderer = new ExceptionRenderer(false);
            renderer.register(CustomBusinessError, (err, req, res) => {
                return res.status(409).json({ business_error: err.message });
            });

            const rawRes = makeFakeServerResponse();
            const res = new Response(rawRes);
            const req = { expectsJson: () => true };

            await renderer.render(new CustomBusinessError("Conflict in reservation"), req, res);

            assert.equal(res.statusCode, 409);
            assert.equal(rawRes.body, JSON.stringify({ business_error: "Conflict in reservation" }));
        });
    });
});
