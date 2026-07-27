import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import Request from "../src/Request.js";
import RequestError from "../src/errors/RequestError.js";

function makeFakeIncomingMessage({ method = "GET", url = "/", headers = {}, socket = {} } = {}) {
    const stream = new Readable({ read() {} });
    stream.method = method;
    stream.url = url;
    stream.headers = headers;
    stream.socket = socket;
    return stream;
}

function makeFakeBodyParserManager(returnValue = {}) {
    return {
        parse: async () => returnValue
    };
}

describe("Request", () => {

    test("constructor should throw if incomingMessage is invalid", () => {
        const bpm = makeFakeBodyParserManager();
        assert.throws(() => new Request(null, bpm), RequestError);
        assert.throws(() => new Request({}, bpm), RequestError);
    });

    test("constructor should throw if bodyParserManager is invalid", () => {
        const raw = makeFakeIncomingMessage();
        assert.throws(() => new Request(raw, null), RequestError);
        assert.throws(() => new Request(raw, {}), RequestError);
    });

    test("method and url should reflect the raw request", () => {
        const raw = makeFakeIncomingMessage({ method: "POST", url: "/users" });
        const req = new Request(raw, makeFakeBodyParserManager());

        assert.equal(req.method, "POST");
        assert.equal(req.url, "/users");
    });

    test("path should extract pathname without query string", () => {
        const raw = makeFakeIncomingMessage({ url: "/users/10?active=true", headers: { host: "localhost" } });
        const req = new Request(raw, makeFakeBodyParserManager());

        assert.equal(req.path, "/users/10");
    });

    test("query should parse query string into an object", () => {
        const raw = makeFakeIncomingMessage({ url: "/search?q=hello&page=2", headers: { host: "localhost" } });
        const req = new Request(raw, makeFakeBodyParserManager());

        assert.deepEqual(req.query(), { q: "hello", page: "2" });
    });

    test("query should be cached after first access", () => {
        const raw = makeFakeIncomingMessage({ url: "/search?q=hello", headers: { host: "localhost" } });
        const req = new Request(raw, makeFakeBodyParserManager());

        const first = req.query();
        const second = req.query();
        assert.strictEqual(first, second);
    });

    test("headers should return an immutable copy of raw headers", () => {
    const raw = makeFakeIncomingMessage({
        headers: { "x-test": "1" }
    });

    const req = new Request(raw, makeFakeBodyParserManager());

    const headers = req.headers;

    assert.notStrictEqual(headers, raw.headers);
    assert.deepEqual(headers, raw.headers);
    assert(Object.isFrozen(headers));

    assert.throws(() => {
        "use strict";
        headers["x-test"] = "changed";
    }, TypeError);

    assert.equal(raw.headers["x-test"], "1");
});

   test("header() should be case-insensitive", () => {
    const raw = makeFakeIncomingMessage({ headers: { "content-type": "application/json" } });
    const req = new Request(raw, makeFakeBodyParserManager());

    assert.equal(req.header("Content-Type"), "application/json");
    assert.equal(req.header("CONTENT-TYPE"), "application/json");
});

    test("hasHeader() should correctly detect header presence", () => {
        const raw = makeFakeIncomingMessage({ headers: { "x-custom": "yes" } });
        const req = new Request(raw, makeFakeBodyParserManager());

        assert.equal(req.hasHeader("x-custom"), true);
        assert.equal(req.hasHeader("x-missing"), false);
    });

    test("cookies should be parsed from the cookie header", () => {
        const raw = makeFakeIncomingMessage({ headers: { cookie: "token=abc123; theme=dark" } });
        const req = new Request(raw, makeFakeBodyParserManager());

        assert.deepEqual(req.cookies, { token: "abc123", theme: "dark" });
    });

    test("cookies should return empty object when no cookie header present", () => {
        const raw = makeFakeIncomingMessage();
        const req = new Request(raw, makeFakeBodyParserManager());

        assert.deepEqual(req.cookies, {});
    });

    test("params should return empty object by default", () => {
        const raw = makeFakeIncomingMessage();
        const req = new Request(raw, makeFakeBodyParserManager());

        assert.deepEqual(req.params, {});
    });

    test("params should reflect what Router sets via attributes", () => {
        const raw = makeFakeIncomingMessage();
        const req = new Request(raw, makeFakeBodyParserManager());

        req.attributes.set("params", { id: "10" });
        assert.deepEqual(req.params, { id: "10" });
    });

    test("body() should delegate to the injected BodyParserManager", async () => {
        const raw = makeFakeIncomingMessage();
        const bpm = makeFakeBodyParserManager({ name: "ECF" });
        const req = new Request(raw, bpm);

        const result = await req.body();
        assert.deepEqual(result, { name: "ECF" });
    });

    test("body() should cache the parsed result", async () => {
        const raw = makeFakeIncomingMessage();
        let callCount = 0;
        const bpm = {
            parse: async () => { callCount++; return { ok: true }; }
        };
        const req = new Request(raw, bpm);

        await req.body();
        await req.body();

        assert.equal(callCount, 1);
    });

    test("ip should read from socket.remoteAddress", () => {
        const raw = makeFakeIncomingMessage({ socket: { remoteAddress: "127.0.0.1" } });
        const req = new Request(raw, makeFakeBodyParserManager());

        assert.equal(req.ip, "127.0.0.1");
    });

    test("secure and protocol should reflect encrypted socket", () => {
        const raw = makeFakeIncomingMessage({ socket: { encrypted: true }, headers: { host: "example.com" } });
        const req = new Request(raw, makeFakeBodyParserManager());

        assert.equal(req.secure, true);
        assert.equal(req.protocol, "https");
    });

    test("secure should respect x-forwarded-proto header", () => {
        const raw = makeFakeIncomingMessage({ headers: { host: "example.com", "x-forwarded-proto": "https" } });
        const req = new Request(raw, makeFakeBodyParserManager());

        assert.equal(req.secure, true);
    });

    test("origin should combine protocol and host", () => {
        const raw = makeFakeIncomingMessage({ headers: { host: "example.com" } });
        const req = new Request(raw, makeFakeBodyParserManager());

        assert.equal(req.origin, "http://example.com");
    });

    test("userAgent should reflect the user-agent header", () => {
        const raw = makeFakeIncomingMessage({ headers: { "user-agent": "TestAgent/1.0" } });
        const req = new Request(raw, makeFakeBodyParserManager());

        assert.equal(req.userAgent, "TestAgent/1.0");
    });

    test("raw should expose the original IncomingMessage", () => {
        const raw = makeFakeIncomingMessage();
        const req = new Request(raw, makeFakeBodyParserManager());

        assert.strictEqual(req.raw, raw);
    });

    test("cookies should fall back to raw value on malformed encoding", () => {
    const raw = makeFakeIncomingMessage({ headers: { cookie: "token=%%%%%%%" } });
    const req = new Request(raw, makeFakeBodyParserManager());

    assert.equal(req.cookies.token, "%%%%%%%");
});

test("header() should trim whitespace from header name", () => {
    const raw = makeFakeIncomingMessage({ headers: { host: "example.com" } });
    const req = new Request(raw, makeFakeBodyParserManager());

    assert.equal(req.header(" Host "), "example.com");
});

test("query should return empty object for a URL with no query string", () => {
    const raw = makeFakeIncomingMessage({ url: "/", headers: { host: "localhost" } });
    const req = new Request(raw, makeFakeBodyParserManager());

    assert.deepEqual(req.query(), {});
});

test("query, headers, cookies, and params should be frozen (immutable)", () => {
    const raw = makeFakeIncomingMessage({
        url: "/search?q=hello",
        headers: { host: "localhost", cookie: "token=abc" }
    });
    const req = new Request(raw, makeFakeBodyParserManager());
    req.attributes.set("params", { id: "10" });

    assert.throws(() => { "use strict"; req.query().q = "changed"; }, TypeError);
    assert.throws(() => { "use strict"; req.headers.host = "changed"; }, TypeError);
    assert.throws(() => { "use strict"; req.cookies.token = "changed"; }, TypeError);
    assert.throws(() => { "use strict"; req.params.id = "changed"; }, TypeError);
});

});