import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import Response from "../src/Response.js";
import ResponseError from "../src/errors/ResponseError.js";

function makeFakeServerResponse() {
    const headers = new Map();
    return {
        statusCode: 200,
        headersSent: false,
        setHeader(name, val) {
            headers.set(name.toLowerCase(), val);
        },
        getHeader(name) {
            return headers.get(name.toLowerCase());
        },
        removeHeader(name) {
            headers.delete(name.toLowerCase());
        },
        end(data) {
            this.body = data;
            this.headersSent = true;
        },
        on() {},
        once() {},
        emit() {},
        destroy() {}
    };
}

describe("Response Enterprise Capabilities (Phase 1 - 5)", () => {

    describe("Phase 1: Foundation & Header Enhancements", () => {
        test("noContent() sets status 204 and empty body", () => {
            const raw = makeFakeServerResponse();
            const res = new Response(raw);

            res.noContent();
            assert.equal(res.statusCode, 204);
            assert.equal(raw.headersSent, true);
        });

        test("appendHeader() supports multi-value headers", () => {
            const raw = makeFakeServerResponse();
            const res = new Response(raw);

            res.appendHeader("Vary", "Accept");
            res.appendHeader("Vary", "User-Agent");

            assert.deepEqual(raw.getHeader("vary"), ["Accept", "User-Agent"]);
        });
    });

    describe("Phase 2: Cookie API", () => {
        test("cookie() serializes Set-Cookie with maxAge, expires, sameSite, httpOnly", () => {
            const raw = makeFakeServerResponse();
            const res = new Response(raw);

            const expDate = new Date("2030-01-01T00:00:00Z");
            res.cookie("theme", "dark", {
                maxAge: 3600,
                expires: expDate,
                path: "/admin",
                secure: true,
                sameSite: "strict"
            });

            const cookieHeader = raw.getHeader("set-cookie");
            assert.equal(typeof cookieHeader, "string");
            assert.ok(cookieHeader.includes("theme=dark"));
            assert.ok(cookieHeader.includes("Max-Age=3600"));
            assert.ok(cookieHeader.includes("Path=/admin"));
            assert.ok(cookieHeader.includes("Secure"));
            assert.ok(cookieHeader.includes("HttpOnly"));
            assert.ok(cookieHeader.includes("SameSite=Strict"));
        });

        test("clearCookie() sets expired Date and empty value", () => {
            const raw = makeFakeServerResponse();
            const res = new Response(raw);

            res.clearCookie("session");

            const cookieHeader = raw.getHeader("set-cookie");
            assert.ok(cookieHeader.includes("session="));
            assert.ok(cookieHeader.includes("Max-Age=0"));
        });
    });

    describe("Phase 2: Cache & HTTP Header Helpers", () => {
        test("contentType() maps shortcut types to MIME headers", () => {
            const raw = makeFakeServerResponse();
            const res = new Response(raw);

            res.contentType("json");
            assert.equal(raw.getHeader("content-type"), "application/json; charset=utf-8");

            res.contentType("pdf");
            assert.equal(raw.getHeader("content-type"), "application/pdf");
        });

        test("cacheControl() and noCache() helper methods", () => {
            const raw = makeFakeServerResponse();
            const res = new Response(raw);

            res.cacheControl({ public: true, maxAge: 86400, mustRevalidate: true });
            assert.equal(raw.getHeader("cache-control"), "public, must-revalidate, max-age=86400");

            const raw2 = makeFakeServerResponse();
            const res2 = new Response(raw2);
            res2.noCache();
            assert.equal(raw2.getHeader("cache-control"), "no-store, no-cache, must-revalidate, proxy-revalidate");
        });

        test("etag(), lastModified(), vary()", () => {
            const raw = makeFakeServerResponse();
            const res = new Response(raw);

            res.etag("12345");
            assert.equal(raw.getHeader("etag"), '"12345"');

            const modDate = new Date("2026-01-01T12:00:00Z");
            res.lastModified(modDate);
            assert.equal(raw.getHeader("last-modified"), modDate.toUTCString());

            res.vary("Accept-Encoding");
            assert.equal(raw.getHeader("vary"), "Accept-Encoding");
        });
    });

    describe("Phase 3 & 4: Stream, File & Download Responses", () => {
        test("stream() pipes readable stream to response", () => {
            const raw = makeFakeServerResponse();
            const res = new Response(raw);

            const stream = Readable.from(["hello ", "world"]);
            res.stream(stream, { contentType: "text" });

            assert.equal(res.headersSent, true);
        });

        test("download() streams file with Content-Disposition header", async () => {
            const tmpDir = os.tmpdir();
            const tmpFile = path.join(tmpDir, `test_download_${Date.now()}.txt`);
            fs.writeFileSync(tmpFile, "file content");

            try {
                const raw = makeFakeServerResponse();
                const res = new Response(raw);

                await res.download(tmpFile, "custom_name.txt");
                assert.ok(raw.getHeader("content-disposition").includes("custom_name.txt"));
            } finally {
                if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
            }
        });
    });

    describe("Phase 5: Double-Send & Safety Guards", () => {
        test("assertNotSent prevents double sending", () => {
            const raw = makeFakeServerResponse();
            const res = new Response(raw);

            res.send("first");
            assert.throws(() => res.send("second"), ResponseError);
            assert.throws(() => res.status(500), ResponseError);
            assert.throws(() => res.header("x", "y"), ResponseError);
        });
    });
});
