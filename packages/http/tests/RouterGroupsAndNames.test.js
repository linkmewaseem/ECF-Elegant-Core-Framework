import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Router from "../src/Router.js";
import Request from "../src/Request.js";
import { Readable } from "node:stream";

function makeFakeIncomingMessage({ method = "GET", url = "/", headers = {}, socket = {} } = {}) {
    const stream = new Readable({ read() {} });
    stream.method = method;
    stream.url = url;
    stream.headers = headers;
    stream.socket = socket;
    return stream;
}

function makeFakeBodyParserManager() {
    return { parse: async () => ({}) };
}

class PhotoController {
    index() { return "index"; }
    create() { return "create"; }
    store() { return "store"; }
    show() { return "show"; }
    edit() { return "edit"; }
    update() { return "update"; }
    destroy() { return "destroy"; }
}

describe("Router & Route Enterprise Capabilities (Phase 1 & Phase 2)", () => {

    describe("Route Groups & Prefixes", () => {
        test("groups routes with a prefix and middleware", () => {
            const router = new Router();
            const dummyMw = () => {};

            router.group({ prefix: "/admin", middleware: [dummyMw] }, (r) => {
                r.get("/dashboard", () => "admin dashboard");
                r.get("/users", () => "admin users");
            });

            const req = new Request(makeFakeIncomingMessage({ url: "/admin/dashboard" }), makeFakeBodyParserManager());
            const matched = router.match(req);

            assert.equal(matched.path, "/admin/dashboard");
            const meta = router.getMetadata("GET", "/admin/dashboard");
            assert.deepEqual(meta.middleware, [dummyMw]);
        });

        test("nested route groups stack prefixes and middleware correctly", () => {
            const router = new Router();
            const mw1 = () => {};
            const mw2 = () => {};

            router.group({ prefix: "/api", middleware: [mw1] }, (r) => {
                r.group({ prefix: "/v1", middleware: [mw2] }, (r2) => {
                    r2.get("/posts", () => "posts");
                });
            });

            const req = new Request(makeFakeIncomingMessage({ url: "/api/v1/posts" }), makeFakeBodyParserManager());
            const matched = router.match(req);

            assert.equal(matched.path, "/api/v1/posts");
            const meta = router.getMetadata("GET", "/api/v1/posts");
            assert.deepEqual(meta.middleware, [mw1, mw2]);
        });
    });

    describe("Named Routes & URL Generator", () => {
        test("registers named routes and builds URLs with params and query string", () => {
            const router = new Router();

            router.get("/users/{id}", () => "user details").name("users.show");

            const url1 = router.url("users.show", { id: 42 });
            assert.equal(url1, "/users/42");

            const url2 = router.url("users.show", { id: 42 }, { tab: "profile", active: true });
            assert.equal(url2, "/users/42?tab=profile&active=true");
        });
    });

    describe("Route Parameter Constraints (.where)", () => {
        test("enforces regex constraint on parameter matching", () => {
            const router = new Router();

            router.get("/users/{id}", () => "numeric user").where("id", /^\d+$/);

            const reqValid = new Request(makeFakeIncomingMessage({ url: "/users/123" }), makeFakeBodyParserManager());
            const matchedValid = router.match(reqValid);
            assert.equal(matchedValid.path, "/users/{id}");
            assert.equal(reqValid.params.id, "123");

            const reqInvalid = new Request(makeFakeIncomingMessage({ url: "/users/abc" }), makeFakeBodyParserManager());
            assert.throws(() => router.match(reqInvalid));
        });
    });

    describe("Resource Controllers", () => {
        test("resource() registers 7 standard RESTful routes with names", () => {
            const router = new Router();
            router.resource("photos", PhotoController);

            assert.equal(router.url("photos.index"), "/photos");
            assert.equal(router.url("photos.create"), "/photos/create");
            assert.equal(router.url("photos.show", { photo: "10" }), "/photos/10");
        });

        test("apiResource() excludes create and edit routes", () => {
            const router = new Router();
            router.apiResource("photos", PhotoController);

            assert.equal(router.findByName("photos.index") !== null, true);
            assert.equal(router.findByName("photos.create"), null);
            assert.equal(router.findByName("photos.edit"), null);
        });
    });

    describe("Fallback Route", () => {
        test("fallback route catches any unmatched request path", () => {
            const router = new Router();
            router.get("/home", () => "home");
            router.fallback(() => "404 Not Found");

            const req = new Request(makeFakeIncomingMessage({ url: "/unknown/path" }), makeFakeBodyParserManager());
            const matched = router.match(req);

            assert.equal(matched.path, "/{__fallback__}");
        });
    });
});
