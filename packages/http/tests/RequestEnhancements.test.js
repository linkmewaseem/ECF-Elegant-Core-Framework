import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import Request from "../src/Request.js";

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

describe("Request Enterprise Enhancements (Phase 1 - 4)", () => {

    describe("Phase 1: Input & Data Manipulation Helpers", () => {
        test("all() should combine params, query, and body", async () => {
            const raw = makeFakeIncomingMessage({ url: "/test?search=node&page=2" });
            const bpm = makeFakeBodyParserManager({ user: { name: "John", profile: { role: "admin" } } });
            const req = new Request(raw, bpm);
            req.attributes.set("params", { id: "10" });

            const allInputs = await req.all();
            assert.equal(allInputs.id, "10");
            assert.equal(allInputs.search, "node");
            assert.equal(allInputs.page, "2");
            assert.deepEqual(allInputs.user, { name: "John", profile: { role: "admin" } });
        });

        test("input() with dot-notation lookup", async () => {
            const raw = makeFakeIncomingMessage({ url: "/test?page=5" });
            const bpm = makeFakeBodyParserManager({ user: { details: { email: "john@example.com" } } });
            const req = new Request(raw, bpm);

            assert.equal(await req.input("page"), "5");
            assert.equal(await req.input("user.details.email"), "john@example.com");
            assert.equal(await req.input("missing.key", "default"), "default");
        });

        test("only() and except() filtering", async () => {
            const raw = makeFakeIncomingMessage({ url: "/test?a=1&b=2&c=3" });
            const bpm = makeFakeBodyParserManager({ d: 4 });
            const req = new Request(raw, bpm);

            const onlyAB = await req.only("a", "b");
            assert.deepEqual(onlyAB, { a: "1", b: "2" });

            const exceptA = await req.except(["a", "c"]);
            assert.deepEqual(exceptA, { b: "2", d: 4 });
        });

        test("has(), hasAny(), filled(), missing()", async () => {
            const raw = makeFakeIncomingMessage({ url: "/test?empty=&active=true" });
            const bpm = makeFakeBodyParserManager({ items: [1, 2], name: "   " });
            const req = new Request(raw, bpm);

            assert.equal(await req.has("active"), true);
            assert.equal(await req.has("missing"), false);
            assert.equal(await req.hasAny("missing", "active"), true);
            assert.equal(await req.hasAny("foo", "bar"), false);

            assert.equal(await req.filled("active"), true);
            assert.equal(await req.filled("items"), true);
            assert.equal(await req.filled("empty"), false);
            assert.equal(await req.filled("name"), false);

            assert.equal(await req.missing("missing"), true);
            assert.equal(await req.missing("active"), false);
        });

        test("Type coercions: boolean, integer, float, string, array", async () => {
            const raw = makeFakeIncomingMessage({ url: "/test?flag=true&num=42&price=19.99&tags=js" });
            const bpm = makeFakeBodyParserManager({ enabled: "1", zero: "0", list: ["a", "b"] });
            const req = new Request(raw, bpm);

            assert.equal(await req.boolean("flag"), true);
            assert.equal(await req.boolean("enabled"), true);
            assert.equal(await req.boolean("zero"), false);
            assert.equal(await req.boolean("missing", false), false);

            assert.equal(await req.integer("num"), 42);
            assert.equal(await req.integer("missing", 10), 10);

            assert.equal(await req.float("price"), 19.99);

            assert.equal(await req.string("num"), "42");
            assert.equal(await req.string("missing", "def"), "def");

            assert.deepEqual(await req.array("list"), ["a", "b"]);
            assert.deepEqual(await req.array("tags"), ["js"]);
            assert.deepEqual(await req.array("missing", []), []);
        });
    });

    describe("Phase 2: Method Helpers & Content Negotiation", () => {
        test("isGet(), isPost(), etc.", () => {
            const reqGet = new Request(makeFakeIncomingMessage({ method: "GET" }), makeFakeBodyParserManager());
            assert.equal(reqGet.isGet(), true);
            assert.equal(reqGet.isPost(), false);

            const reqPost = new Request(makeFakeIncomingMessage({ method: "POST" }), makeFakeBodyParserManager());
            assert.equal(reqPost.isPost(), true);
            assert.equal(reqPost.isMethod("post"), true);
        });

        test("accepts() and prefers()", () => {
            const raw = makeFakeIncomingMessage({ headers: { accept: "text/html,application/json;q=0.9,*/*;q=0.8" } });
            const req = new Request(raw, makeFakeBodyParserManager());

            assert.equal(req.accepts("json"), true);
            assert.equal(req.accepts("html"), true);
            assert.equal(req.prefers(["json", "html"]), "html");
        });

        test("expectsJson(), ajax(), pjax(), prefetch()", () => {
            const rawAjax = makeFakeIncomingMessage({ headers: { "x-requested-with": "XMLHttpRequest" } });
            const reqAjax = new Request(rawAjax, makeFakeBodyParserManager());
            assert.equal(reqAjax.ajax(), true);
            assert.equal(reqAjax.expectsJson(), true);

            const rawPjax = makeFakeIncomingMessage({ headers: { "x-pjax": "true" } });
            const reqPjax = new Request(rawPjax, makeFakeBodyParserManager());
            assert.equal(reqPjax.pjax(), true);

            const rawPrefetch = makeFakeIncomingMessage({ headers: { purpose: "prefetch" } });
            const reqPrefetch = new Request(rawPrefetch, makeFakeBodyParserManager());
            assert.equal(reqPrefetch.prefetch(), true);
        });
    });

    describe("Phase 3: Cookie, Query & Route Helpers", () => {
        test("cookie() and hasCookie()", () => {
            const raw = makeFakeIncomingMessage({ headers: { cookie: "theme=dark; sessionId=12345" } });
            const req = new Request(raw, makeFakeBodyParserManager());

            assert.equal(req.cookie("theme"), "dark");
            assert.equal(req.cookie("missing", "light"), "light");
            assert.equal(req.hasCookie("sessionId"), true);
            assert.equal(req.hasCookie("missing"), false);
        });

        test("query object and function with dot notation", () => {
            const raw = makeFakeIncomingMessage({ url: "/search?q=hello&status=active" });
            const req = new Request(raw, makeFakeBodyParserManager());

            assert.equal(req.query().q, "hello");
            assert.equal(req.query("q"), "hello");
            assert.equal(req.query("status"), "active");
            assert.equal(req.query("missing", "default"), "default");
        });

        test("route(), routeName(), parameter()", () => {
            const raw = makeFakeIncomingMessage();
            const req = new Request(raw, makeFakeBodyParserManager());

            const mockRoute = { name: "users.show", path: "/users/:id" };
            req.attributes.set("route", mockRoute);
            req.attributes.set("params", { id: "42" });

            assert.strictEqual(req.route(), mockRoute);
            assert.equal(req.route("name"), "users.show");
            assert.equal(req.routeName(), "users.show");
            assert.equal(req.parameter("id"), "42");
            assert.equal(req.param("id"), "42");
        });
    });

    describe("Phase 4: Trust Proxy & Uploaded Files", () => {
        test("ip resolution without proxy trust", () => {
            const raw = makeFakeIncomingMessage({
                headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18", "cf-connecting-ip": "1.1.1.1" },
                socket: { remoteAddress: "127.0.0.1" }
            });
            const req = new Request(raw, makeFakeBodyParserManager());

            assert.equal(req.ip, "127.0.0.1");
            assert.deepEqual(req.ips, []);
        });

        test("ip resolution with proxy trust enabled", () => {
            const raw = makeFakeIncomingMessage({
                headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18", "cf-connecting-ip": "1.1.1.1" },
                socket: { remoteAddress: "127.0.0.1" }
            });
            const req = new Request(raw, makeFakeBodyParserManager());
            req.setTrustProxy(true);

            assert.equal(req.ip, "1.1.1.1");
            assert.deepEqual(req.ips, ["203.0.113.195", "70.41.3.18"]);
        });

        test("file() and files() accessors", async () => {
            const fakeFiles = { avatar: { name: "profile.png", size: 1024 } };
            const raw = makeFakeIncomingMessage();
            const bpm = makeFakeBodyParserManager({ $files: fakeFiles, name: "John" });
            const req = new Request(raw, bpm);

            assert.deepEqual(await req.files(), fakeFiles);
            assert.deepEqual(await req.file("avatar"), { name: "profile.png", size: 1024 });
            assert.equal(await req.file("missing"), null);
        });
    });
});
