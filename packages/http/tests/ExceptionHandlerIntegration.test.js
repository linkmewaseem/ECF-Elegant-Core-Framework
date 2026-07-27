import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";

import ExceptionHandler from "../src/exceptions/ExceptionHandler.js";
import HttpKernel from "../src/HttpKernel.js";
import Router from "../src/Router.js";
import NotFoundException from "../src/exceptions/NotFoundException.js";
import ValidationException from "../src/exceptions/ValidationException.js";
import RateLimitException from "../src/exceptions/RateLimitException.js";
import MethodNotAllowedException from "../src/exceptions/MethodNotAllowedException.js";

function makeFakeIncomingMessage({ method = "GET", url = "/", headers = {} } = {}) {
    const stream = new Readable({ read() {} });
    stream.method = method;
    stream.url = url;
    stream.headers = headers;
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

function makeFakeBodyParserManager() { return { parse: async () => ({}) }; }

describe("ExceptionHandler - Integration with HttpKernel", () => {

    test("handles thrown NotFoundException seamlessly returning 404 response", async () => {
        const router = new Router();
        router.get("/users/{id}", () => {
            throw new NotFoundException("User not found in system");
        });

        const handler = new ExceptionHandler({ debug: false });
        const resolver = { resolve: () => [] };
        const kernel = new HttpKernel(router, makeFakeBodyParserManager(), resolver, handler);

        const rawReq = makeFakeIncomingMessage({ url: "/users/999", headers: { accept: "application/json" } });
        const rawRes = makeFakeServerResponse();

        const res = await kernel.handle(rawReq, rawRes);

        assert.equal(res.statusCode, 404);
        const parsed = JSON.parse(rawRes.body);
        assert.equal(parsed.statusCode, 404);
        assert.equal(parsed.message, "User not found in system");
    });

    test("handles ValidationException returning 422 JSON with error bag", async () => {
        const router = new Router();
        router.post("/register", () => {
            throw ValidationException.withErrors({
                email: ["Email is invalid"],
                password: ["Password must be at least 8 characters"]
            });
        });

        const handler = new ExceptionHandler({ debug: false });
        const resolver = { resolve: () => [] };
        const kernel = new HttpKernel(router, makeFakeBodyParserManager(), resolver, handler);

        const rawReq = makeFakeIncomingMessage({ method: "POST", url: "/register", headers: { accept: "application/json" } });
        const rawRes = makeFakeServerResponse();

        const res = await kernel.handle(rawReq, rawRes);

        assert.equal(res.statusCode, 422);
        const parsed = JSON.parse(rawRes.body);
        assert.equal(parsed.statusCode, 422);
        assert.deepEqual(parsed.errors, {
            email: ["Email is invalid"],
            password: ["Password must be at least 8 characters"]
        });
    });

    test("handles RateLimitException returning 429 with Retry-After header", async () => {
        const router = new Router();
        router.get("/api/data", () => {
            throw new RateLimitException("Too Many Requests", 120);
        });

        const handler = new ExceptionHandler({ debug: false });
        const resolver = { resolve: () => [] };
        const kernel = new HttpKernel(router, makeFakeBodyParserManager(), resolver, handler);

        const rawReq = makeFakeIncomingMessage({ url: "/api/data", headers: { accept: "application/json" } });
        const rawRes = makeFakeServerResponse();

        const res = await kernel.handle(rawReq, rawRes);

        assert.equal(res.statusCode, 429);
        assert.equal(rawRes.getHeader("retry-after"), "120");
    });

    test("handles MethodNotAllowedException returning 405 with Allow header", async () => {
        const router = new Router();
        router.get("/posts", () => "ok");

        const handler = new ExceptionHandler({ debug: false });
        const resolver = { resolve: () => [] };
        const kernel = new HttpKernel(router, makeFakeBodyParserManager(), resolver, handler);

        router.addRoute("POST", "/posts", () => {
            throw new MethodNotAllowedException("POST not allowed", ["GET", "HEAD"]);
        });

        const rawReq = makeFakeIncomingMessage({ method: "POST", url: "/posts", headers: { accept: "application/json" } });
        const rawRes = makeFakeServerResponse();

        const res = await kernel.handle(rawReq, rawRes);

        assert.equal(res.statusCode, 405);
        assert.equal(rawRes.getHeader("allow"), "GET, HEAD");
    });
});
