import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Writable } from "node:stream";
import Response from "../src/Response.js";
import HttpKernel from "../src/HttpKernel.js";

function makeFakeServerResponse() {
    const headers = new Map();
    const chunks = [];
    const writable = new Writable({
        write(chunk, encoding, callback) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            writable.headersSent = true;
            if (callback) callback();
        }
    });
    writable.statusCode = 200;
    writable.headersSent = false;
    writable.setHeader = (name, val) => headers.set(name.toLowerCase(), val);
    writable.getHeader = (name) => headers.get(name.toLowerCase());
    writable.removeHeader = (name) => headers.delete(name.toLowerCase());
    const origEnd = writable.end.bind(writable);
    writable.end = (data) => {
        if (data !== undefined) writable.write(data);
        origEnd();
        writable.headersSent = true;
        writable.binaryBody = Buffer.concat(chunks);
    };
    return writable;
}

function createKernel(handler = () => {}) {
    const router = { match: () => ({ handler }) };
    const bpm = { parse: async () => ({}) };
    const resolver = { resolve: () => [] };
    return new HttpKernel(router, bpm, resolver);
}

describe("Binary Response Handling (Buffer, Uint8Array, ArrayBuffer)", () => {
    test("res.send(Buffer) sends raw binary without JSON stringifying", () => {
        const raw = makeFakeServerResponse();
        const res = new Response(raw);
        const buf = Buffer.from("Hello Binary World");

        res.send(buf);

        assert.equal(raw.binaryBody.toString("utf-8"), "Hello Binary World");
    });

    test("res.send(Uint8Array) sends raw binary without JSON stringifying", () => {
        const raw = makeFakeServerResponse();
        const res = new Response(raw);
        const uint8 = new TextEncoder().encode("TypedArray Content");

        res.send(uint8);

        assert.equal(raw.binaryBody.toString("utf-8"), "TypedArray Content");
    });

    test("res.buffer(Uint8Array) sets content-type and sends binary", () => {
        const raw = makeFakeServerResponse();
        const res = new Response(raw);
        const uint8 = new TextEncoder().encode("Image or PDF data");

        res.buffer(uint8, "application/pdf");

        assert.equal(raw.getHeader("content-type"), "application/pdf");
        assert.equal(raw.binaryBody.toString("utf-8"), "Image or PDF data");
    });

    test("HttpKernel.normalizeResponse handles Uint8Array return values", async () => {
        const kernel = createKernel();
        const raw = makeFakeServerResponse();
        const res = new Response(raw);
        const uint8 = new TextEncoder().encode("Controller binary return");

        await kernel.normalizeResponse(uint8, {}, res);

        assert.equal(raw.binaryBody.toString("utf-8"), "Controller binary return");
    });
});
