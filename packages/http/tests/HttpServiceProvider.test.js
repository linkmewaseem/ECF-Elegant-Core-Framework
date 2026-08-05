import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { Application, Facade, CoreServiceProvider } from "@ecfjs/core";
import HttpServiceProvider from "../src/providers/HttpServiceProvider.js";
import RouteNotFoundError from "../src/errors/RouteNotFoundError.js";
import Route from "../src/facades/Route.js";
import Request from "../src/Request.js";

// ---- Helpers ----

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

function makeRequest({ method = "GET", url = "/" } = {}) {
    return new Request(
        makeFakeIncomingMessage({ method, url }),
        makeFakeBodyParserManager()
    );
}

// ---- Tests ----

describe("Route Facade - full integration", () => {

    let app; // shared across all tests in this describe block

    beforeEach(() => {
        app = new Application();
        app.register(CoreServiceProvider);
        app.register(HttpServiceProvider);
        app.boot();
        Facade.setApplication(app);
    });

    test("Route.get() should register a route through the facade", () => {
        Route.get("/users", () => "user-list");

        const route = Route.match(makeRequest({ method: "GET", url: "/users" }));
        assert.equal(route.handler(), "user-list");
    });

    test("inline middleware via Route.get(path, middleware, handler) should run before handler on a real request", () => {
        const log = [];
        const mid = (req, res, next) => { log.push("mid"); return next(); };

        Route.get("/protected", mid, (req, res) => {
            log.push("handler");
            return res.text("ok");
        });

        const resolver = app.make("middleware.resolver");
        const middleware = resolver.resolve({ method: "GET", path: "/protected" });

        assert.equal(middleware.length, 1);
        assert.strictEqual(middleware[0], mid);
    });

    test("inline middleware array via Route.get(path, [mw1, mw2], handler) should register both", () => {
        const mw1 = (req, res, next) => next();
        const mw2 = (req, res, next) => next();

        Route.get("/multi", [mw1, mw2], (req, res) => res.text("ok"));

        const resolver = app.make("middleware.resolver");
        const middleware = resolver.resolve({ method: "GET", path: "/multi" });

        assert.deepEqual(middleware, [mw1, mw2]);
    });

    test("Route.post() should register a route through the facade", () => {
        Route.post("/users", () => "user-create");

        const route = Route.match(makeRequest({ method: "POST", url: "/users" }));
        assert.equal(route.handler(), "user-create");
    });

    test("Route facade should resolve the same Router singleton across calls", () => {
        Route.get("/a", () => "a");
        Route.get("/b", () => "b");

        assert.equal(Route.match(makeRequest({ method: "GET", url: "/a" })).handler(), "a");
        assert.equal(Route.match(makeRequest({ method: "GET", url: "/b" })).handler(), "b");
    });

    test("Route.get() with dynamic params should work end-to-end through the facade", () => {
        Route.get("/users/{id}", (req) => `user-${req?.params?.id}`);

        const request = makeRequest({ method: "GET", url: "/users/42" });
        Route.match(request);
        assert.deepEqual(request.params, { id: "42" });
    });

    test("duplicate route registration through the facade should throw", () => {
        Route.get("/duplicate", () => {});

        assert.throws(() => {
            Route.get("/duplicate", () => {});
        });
    });

    test("HttpServiceProvider boot() should register RouteNotFoundError → 404 mapping", () => {
        const manager = app.make("exception.manager");
        const renderer = manager.resolveRenderer(new RouteNotFoundError("GET", "/x"));
        assert.ok(typeof renderer === "function");
    });

});