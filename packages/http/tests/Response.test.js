import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Response from "../src/Response.js";
import ResponseError from "../src/errors/ResponseError.js";

function makeFakeServerResponse() {
    const calls = {
        headers: {},
        body: null,
        ended: false
    };

    const raw = {
        headersSent: false,
        statusCode: 200,
        setHeader(name, value) {
            calls.headers[name.toLowerCase()] = value;
        },
        getHeader(name) {
            return calls.headers[name.toLowerCase()];
        },
        removeHeader(name) {
            delete calls.headers[name.toLowerCase()];
        },
        end(body) {
            calls.ended = true;
            calls.body = body ?? null;
            raw.headersSent = true;
        }
    };

    return { raw, calls };
}

describe("Response - constructor", () => {

    test("should throw ResponseError if raw is invalid", () => {
        assert.throws(() => new Response(null), ResponseError);
        assert.throws(() => new Response({}), ResponseError);
    });

    test("should accept a valid ServerResponse-like object", () => {
        const { raw } = makeFakeServerResponse();
        assert.doesNotThrow(() => new Response(raw));
    });

});

describe("Response - send() body validation", () => {

    test("should throw ResponseError for unsupported body types", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        assert.throws(() => res.send(Symbol("test")), ResponseError);
        assert.throws(() => res.send(() => {}), ResponseError);
        assert.throws(() => res.send(10n), ResponseError);
    });

    test("should allow null body (no content)", () => {
        const { raw, calls } = makeFakeServerResponse();
        const res = new Response(raw);

        assert.doesNotThrow(() => res.send(null));
        assert.equal(calls.body, null);
    });

});

describe("Response - send() auto-detection", () => {

    test("send() with an object should auto-delegate to json()", () => {
        const { raw, calls } = makeFakeServerResponse();
        const res = new Response(raw);

        res.send({ framework: "ECF" });

        assert.equal(calls.headers["content-type"], "application/json; charset=utf-8");
        assert.equal(calls.body, JSON.stringify({ framework: "ECF" }));
    });

    test("send() with a Buffer should send it raw", () => {
        const { raw, calls } = makeFakeServerResponse();
        const res = new Response(raw);

        const buf = Buffer.from("binary-data");
        res.send(buf);

        assert.strictEqual(calls.body, buf);
    });

    test("send() with a string should send it as-is", () => {
        const { raw, calls } = makeFakeServerResponse();
        const res = new Response(raw);

        res.send("plain text");
        assert.equal(calls.body, "plain text");
    });

});

describe("Response - status()", () => {

    test("should set the status code and return this for chaining", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        const result = res.status(201);
        assert.strictEqual(result, res);
        assert.equal(raw.statusCode, 201);
    });

    test("should throw ResponseError for invalid status codes", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        assert.throws(() => res.status(99), ResponseError);
        assert.throws(() => res.status(600), ResponseError);
        assert.throws(() => res.status("200"), ResponseError);
        assert.throws(() => res.status(null), ResponseError);
    });

    test("should accept valid boundary status codes", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        assert.doesNotThrow(() => res.status(100));
        assert.doesNotThrow(() => res.status(599));
    });

    test("should throw ResponseError if called after response has been sent", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        res.send("done");
        assert.throws(() => res.status(500), ResponseError);
    });

});

describe("Response - header()", () => {

    test("should set a header and return this for chaining", () => {
        const { raw, calls } = makeFakeServerResponse();
        const res = new Response(raw);

        const result = res.header("X-Powered-By", "ECF");
        assert.strictEqual(result, res);
        assert.equal(calls.headers["x-powered-by"], "ECF");
    });

    test("should trim whitespace from header name", () => {
        const { raw, calls } = makeFakeServerResponse();
        const res = new Response(raw);

        res.header(" X-Test ", "1");
        assert.equal(calls.headers["x-test"], "1");
    });

    test("should throw ResponseError for invalid header name", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        assert.throws(() => res.header("", "value"), ResponseError);
        assert.throws(() => res.header(null, "value"), ResponseError);
    });

    test("should throw ResponseError for invalid header value", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        assert.throws(() => res.header("X-Test", undefined), ResponseError);
        assert.throws(() => res.header("X-Test", null), ResponseError);
        assert.throws(() => res.header("X-Test", {}), ResponseError);
    });

    test("should allow string, number, and boolean header values", () => {
        const { raw, calls } = makeFakeServerResponse();
        const res = new Response(raw);

        res.header("X-String", "abc");
        res.header("X-Number", 123);
        res.header("X-Bool", true);

        assert.equal(calls.headers["x-string"], "abc");
        assert.equal(calls.headers["x-number"], 123);
        assert.equal(calls.headers["x-bool"], true);
    });

    test("should throw ResponseError if called after response has been sent", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        res.send("done");
        assert.throws(() => res.header("X-Test", "1"), ResponseError);
    });

});

describe("Response - hasHeader()", () => {

    test("should correctly report header presence", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        assert.equal(res.hasHeader("X-Test"), false);
        res.header("X-Test", "yes");
        assert.equal(res.hasHeader("X-Test"), true);
    });

    test("should be case-insensitive", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        res.header("X-Test", "yes");
        assert.equal(res.hasHeader("x-test"), true);
        assert.equal(res.hasHeader("X-TEST"), true);
    });

});

describe("Response - removeHeader()", () => {

    test("should remove a previously set header and return this", () => {
        const { raw, calls } = makeFakeServerResponse();
        const res = new Response(raw);

        res.header("X-Test", "yes");
        const result = res.removeHeader("X-Test");

        assert.strictEqual(result, res);
        assert.equal(res.hasHeader("X-Test"), false);
        assert.equal(calls.headers["x-test"], undefined);
    });

    test("should throw ResponseError for invalid header name", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        assert.throws(() => res.removeHeader(""), ResponseError);
    });

    test("should throw ResponseError if called after response has been sent", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        res.header("X-Test", "1");
        res.send("done");
        assert.throws(() => res.removeHeader("X-Test"), ResponseError);
    });

});

describe("Response - text()", () => {

    test("should set content-type to text/plain and send the body", () => {
        const { raw, calls } = makeFakeServerResponse();
        const res = new Response(raw);

        res.text("Hello ECF");

        assert.equal(calls.headers["content-type"], "text/plain; charset=utf-8");
        assert.equal(calls.body, "Hello ECF");
        assert.equal(calls.ended, true);
    });

    test("should throw ResponseError if body is not a string", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        assert.throws(() => res.text(123), ResponseError);
        assert.throws(() => res.text(null), ResponseError);
    });

});

describe("Response - html()", () => {

    test("should set content-type to text/html and send the body", () => {
        const { raw, calls } = makeFakeServerResponse();
        const res = new Response(raw);

        res.html("<h1>ECF</h1>");

        assert.equal(calls.headers["content-type"], "text/html; charset=utf-8");
        assert.equal(calls.body, "<h1>ECF</h1>");
        assert.equal(calls.ended, true);
    });

    test("should throw ResponseError if body is not a string", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        assert.throws(() => res.html(123), ResponseError);
    });

});

describe("Response - json()", () => {

    test("should set content-type to application/json and send serialized body", () => {
        const { raw, calls } = makeFakeServerResponse();
        const res = new Response(raw);

        res.json({ framework: "ECF" });

        assert.equal(calls.headers["content-type"], "application/json; charset=utf-8");
        assert.equal(calls.body, JSON.stringify({ framework: "ECF" }));
        assert.equal(calls.ended, true);
    });

    test("should support arrays and primitives", () => {
        const { raw, calls } = makeFakeServerResponse();
        const res = new Response(raw);

        res.json([1, 2, 3]);
        assert.equal(calls.body, "[1,2,3]");
    });

    test("should throw ResponseError if data cannot be serialized (circular reference)", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        const circular = {};
        circular.self = circular;

        assert.throws(() => res.json(circular), ResponseError);
    });

});

describe("Response - send()", () => {

    test("should write status, headers and end the response", () => {
        const { raw, calls } = makeFakeServerResponse();
        const res = new Response(raw);

        res.status(201).header("X-Test", "1").send("done");

        assert.equal(raw.statusCode, 201);
        assert.equal(calls.headers["x-test"], "1");
        assert.equal(calls.body, "done");
    });

    test("should throw ResponseError if response already sent", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        res.send("first");
        assert.throws(() => res.send("second"), ResponseError);
    });

});

describe("Response - redirect()", () => {

    test("should set Location header, default status 302, and end response", () => {
        const { raw, calls } = makeFakeServerResponse();
        const res = new Response(raw);

        res.redirect("/login");

        assert.equal(calls.headers["location"], "/login");
        assert.equal(raw.statusCode, 302);
        assert.equal(calls.ended, true);
    });

    test("should support a custom redirect status code", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        res.redirect("/new-place", 301);

        assert.equal(raw.statusCode, 301);
    });

    test("should throw ResponseError for invalid redirect status", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        assert.throws(() => res.redirect("/x", 200), ResponseError);
    });

    test("should throw ResponseError if url is not a non-empty string", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        assert.throws(() => res.redirect(""), ResponseError);
        assert.throws(() => res.redirect(null), ResponseError);
    });

});

describe("Response - end()", () => {

    test("should end the response without a body", () => {
        const { raw, calls } = makeFakeServerResponse();
        const res = new Response(raw);

        res.status(204).end();

        assert.equal(raw.statusCode, 204);
        assert.equal(calls.body, null);
        assert.equal(calls.ended, true);
    });

    test("should throw ResponseError if already sent", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        res.end();
        assert.throws(() => res.end(), ResponseError);
    });

});

describe("Response - headersSent", () => {

    test("should reflect false before sending", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        assert.equal(res.headersSent, false);
    });

    test("should reflect true after sending", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        res.send("done");
        assert.equal(res.headersSent, true);
    });

});

describe("Response - raw", () => {

    test("should expose the original raw ServerResponse", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw);

        assert.strictEqual(res.raw, raw);
    });

});

describe("Response - fluent API (integration)", () => {

    test("full chain should work end-to-end", () => {
        const { raw, calls } = makeFakeServerResponse();
        const res = new Response(raw);

        res.status(200)
            .header("X-Powered-By", "ECF")
            .json({ framework: "ECF" });

        assert.equal(raw.statusCode, 200);
        assert.equal(calls.headers["x-powered-by"], "ECF");
        assert.equal(calls.headers["content-type"], "application/json; charset=utf-8");
        assert.equal(calls.body, JSON.stringify({ framework: "ECF" }));
    });

});

describe("Response - view()", () => {

    test("should throw ResponseError if no view engine is in context", async () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw); // no context

        await assert.rejects(() => res.view("home"), ResponseError);
    });

    test("should render via context.view and send as HTML", async () => {
        const { raw, calls } = makeFakeServerResponse();
        const fakeViewEngine = {
            render: async (name, data) => `<h1>${data.title}</h1>`
        };
        const res = new Response(raw, { view: fakeViewEngine });

        await res.view("home", { title: "Hello" });

        assert.equal(calls.headers["content-type"], "text/html; charset=utf-8");
        assert.equal(calls.body, "<h1>Hello</h1>");
    });

});

describe("Response - context", () => {

    test("context should be frozen (immutable)", () => {
        const { raw } = makeFakeServerResponse();
        const res = new Response(raw, { view: { render: async () => "" } });

        assert.throws(() => { "use strict"; res.context.view = null; }, TypeError);
    });

    test("should throw ResponseError if context.view lacks render()", () => {
        const { raw } = makeFakeServerResponse();
        assert.throws(() => new Response(raw, { view: {} }), ResponseError);
    });

    test("should throw ResponseError if context is not an object", () => {
        const { raw } = makeFakeServerResponse();
        assert.throws(() => new Response(raw, "not-an-object"), ResponseError);
        assert.throws(() => new Response(raw, null), ResponseError);
    });

    test("has() and get() should reflect context correctly", () => {
        const { raw } = makeFakeServerResponse();
        const fakeView = { render: async () => "" };
        const res = new Response(raw, { view: fakeView });

        assert.equal(res.has("view"), true);
        assert.strictEqual(res.get("view"), fakeView);
        assert.equal(res.has("assets"), false);
    });

});