import { describe, test } from "node:test";
import assert from "node:assert/strict";
import HttpKernel from "../src/HttpKernel.js";
import Response from "../src/Response.js";
import Request from "../src/Request.js";
import { Readable } from "node:stream";

function makeFakeIncomingMessage() {
    const stream = new Readable({ read() {} });
    stream.method = "GET";
    stream.url = "/";
    stream.headers = {};
    return stream;
}

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

function createKernel(handler) {
    const router = { match: () => ({ handler }) };
    const bpm = { parse: async () => ({}) };
    const resolver = { resolve: () => [] };
    return new HttpKernel(router, bpm, resolver);
}

describe("HttpKernel - Response Normalization", () => {

    test("normalizes String return value to HTML response", async () => {
        const kernel = createKernel(() => "<h1>Hello World</h1>");
        const rawRes = makeFakeServerResponse();
        const res = await kernel.handle(makeFakeIncomingMessage(), rawRes);

        assert.equal(res.statusCode, 200);
        assert.equal(rawRes.getHeader("content-type"), "text/html; charset=utf-8");
        assert.equal(rawRes.body, "<h1>Hello World</h1>");
    });

    test("normalizes Object return value to JSON response", async () => {
        const kernel = createKernel(() => ({ name: "ECF", active: true }));
        const rawRes = makeFakeServerResponse();
        const res = await kernel.handle(makeFakeIncomingMessage(), rawRes);

        assert.equal(res.statusCode, 200);
        assert.equal(rawRes.getHeader("content-type"), "application/json; charset=utf-8");
        assert.equal(rawRes.body, JSON.stringify({ name: "ECF", active: true }));
    });

    test("normalizes Buffer return value to raw response", async () => {
        const buf = Buffer.from("raw buffer data");
        const kernel = createKernel(() => buf);
        const rawRes = makeFakeServerResponse();
        const res = await kernel.handle(makeFakeIncomingMessage(), rawRes);

        assert.equal(res.statusCode, 200);
        assert.equal(rawRes.body, buf);
    });

    test("passes Response instance through untouched", async () => {
        const kernel = createKernel((req, res) => res.status(201).json({ created: true }));
        const rawRes = makeFakeServerResponse();
        const res = await kernel.handle(makeFakeIncomingMessage(), rawRes);

        assert.equal(res.statusCode, 201);
        assert.equal(rawRes.getHeader("content-type"), "application/json; charset=utf-8");
        assert.equal(rawRes.body, JSON.stringify({ created: true }));
    });

    test("normalizes object with render() method (View instance)", async () => {
        const fakeView = { render: async () => "<p>Rendered View</p>" };
        const kernel = createKernel(() => fakeView);
        const rawRes = makeFakeServerResponse();
        const res = await kernel.handle(makeFakeIncomingMessage(), rawRes);

        assert.equal(res.statusCode, 200);
        assert.equal(rawRes.getHeader("content-type"), "text/html; charset=utf-8");
        assert.equal(rawRes.body, "<p>Rendered View</p>");
    });
});
