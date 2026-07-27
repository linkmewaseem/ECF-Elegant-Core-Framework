import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import HttpKernel from "../src/HttpKernel.js";
import HttpKernelError from "../src/errors/HttpKernelError.js";
import RouteNotFoundError from "../src/errors/RouteNotFoundError.js";
import Request from "../src/Request.js";
import Response from "../src/Response.js";
import MiddlewareRegistry from "../src/middleware/MiddlewareRegistry.js";
import MiddlewareResolver from "../src/middleware/MiddlewareResolver.js";

// ---- Helpers ----

function makeFakeIncomingMessage({ method = "GET", url = "/", headers = {}, socket = {} } = {}) {
    const stream = new Readable({ read() {} });
    stream.method = method;
    stream.url = url;
    stream.headers = headers;
    stream.socket = socket;
    return stream;
}

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
        },
        on() {}, once() {}, emit() {}, destroy() {}
    };

    return { raw, calls };
}

function makeFakeBodyParserManager(returnValue = {}) {
    return {
        parse: async () => returnValue
    };
}

function makeFakeRouter() {
    const routes = [];
    const metadata = new Map();

    return {
        addRoute(method, path, ...args) {
            const middleware = args.length > 1 ? (Array.isArray(args[0]) ? args[0] : [args[0]]) : [];
            const handler = args[args.length - 1];

            const paramNames = [];
            const regexBody = path.split("/").filter(Boolean).map((seg) => {
                const m = seg.match(/^\{([a-zA-Z_]\w*)\}$/);
                if (m) {
                    paramNames.push(m[1]);
                    return "([^/]+)";
                }
                return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            }).join("/");
            const regex = new RegExp(`^/${regexBody}$`);

            routes.push({ method: method.toUpperCase(), regex, paramNames, handler, path });

            const key = `${method.toUpperCase()}:${path}`;
            if (!metadata.has(key)) {
                metadata.set(key, { middleware: [] });
            }
            metadata.get(key).middleware.push(...middleware);
        },

        getMetadata(method, path) {
            const key = `${method.toUpperCase()}:${path}`;
            return metadata.get(key) ?? { middleware: [] };
        },

        match(request) {
            const method = request.method;
            const path = request.path;

            for (const r of routes) {
                if (r.method !== method.toUpperCase()) continue;
                const result = r.regex.exec(path);
                if (result) {
                    const params = {};
                    r.paramNames.forEach((name, i) => {
                        params[name] = result[i + 1];
                    });

                    request.attributes.set("params", params);
                    return { handler: r.handler, method: r.method, path: r.path };
                }
            }

            throw new RouteNotFoundError(method, path);
        }
    };
}

function makeMiddlewareResolver(routerOrOptions, optionsArg) {
    let router;
    let options;

    if (routerOrOptions && typeof routerOrOptions.getMetadata === "function") {
        router = routerOrOptions;
        options = optionsArg ?? {};
    } else {
        options = routerOrOptions ?? {};
        router = options.router ?? makeFakeRouter();
    }

    const registry = new MiddlewareRegistry();
    (options.global ?? []).forEach((fn) => registry.global(fn));
    (options.route ?? []).forEach(([method, path, fn]) => {
        router.addRoute(method, path, fn, () => {});
    });
    return new MiddlewareResolver(router, registry);
}

function makeKernel({ router, bodyParserManager, middlewareResolver, exceptionHandler, responseContext } = {}) {
    const r = router ?? makeFakeRouter();
    const resolver = middlewareResolver ?? makeMiddlewareResolver(r);
    return new HttpKernel(
        r,
        bodyParserManager ?? makeFakeBodyParserManager(),
        resolver,
        exceptionHandler,
        responseContext ?? {}
    );
}

// ---- Constructor validation ----

describe("HttpKernel - constructor", () => {

    test("should accept valid router, bodyParserManager, and middlewareResolver", () => {
        assert.doesNotThrow(() => makeKernel());
    });

    test("should throw HttpKernelError if router is null", () => {
        assert.throws(
            () => new HttpKernel(null, makeFakeBodyParserManager(), makeMiddlewareResolver()),
            HttpKernelError
        );
    });

    test("should throw HttpKernelError if router lacks match()", () => {
        assert.throws(
            () => new HttpKernel({}, makeFakeBodyParserManager(), makeMiddlewareResolver()),
            HttpKernelError
        );
    });

    test("should throw HttpKernelError if bodyParserManager is null", () => {
        assert.throws(
            () => new HttpKernel(makeFakeRouter(), null, makeMiddlewareResolver()),
            HttpKernelError
        );
    });

    test("should throw HttpKernelError if bodyParserManager lacks parse()", () => {
        assert.throws(
            () => new HttpKernel(makeFakeRouter(), {}, makeMiddlewareResolver()),
            HttpKernelError
        );
    });

    test("should throw HttpKernelError if middlewareResolver is null", () => {
        assert.throws(
            () => new HttpKernel(makeFakeRouter(), makeFakeBodyParserManager(), null),
            HttpKernelError
        );
    });

    test("should throw HttpKernelError if middlewareResolver lacks resolve()", () => {
        assert.throws(
            () => new HttpKernel(makeFakeRouter(), makeFakeBodyParserManager(), {}),
            HttpKernelError
        );
    });

});

// ---- handle() - Route resolution ----

describe("HttpKernel - handle() route resolution", () => {

    test("should throw RouteNotFoundError when no route matches", async () => {
        const kernel = makeKernel();

        const rawReq = makeFakeIncomingMessage({ method: "GET", url: "/not-found" });
        const { raw: rawRes } = makeFakeServerResponse();

        await assert.rejects(
            async () => await kernel.handle(rawReq, rawRes),
            RouteNotFoundError
        );
    });

    test("should resolve a matching static route and call its handler", async () => {
        const router = makeFakeRouter();
        let handlerCalled = false;

        router.addRoute("GET", "/", (req, res) => {
            handlerCalled = true;
        });

        const kernel = makeKernel({ router });

        const rawReq = makeFakeIncomingMessage({ method: "GET", url: "/" });
        const { raw: rawRes } = makeFakeServerResponse();

        await kernel.handle(rawReq, rawRes);

        assert.equal(handlerCalled, true);
    });

    test("should resolve a matching dynamic route and set params on request", async () => {
        const router = makeFakeRouter();
        let capturedParams = null;

        router.addRoute("GET", "/users/{id}", (req, res) => {
            capturedParams = req.params;
        });

        const kernel = makeKernel({ router });

        const rawReq = makeFakeIncomingMessage({ method: "GET", url: "/users/42" });
        const { raw: rawRes } = makeFakeServerResponse();

        await kernel.handle(rawReq, rawRes);

        assert.deepEqual(capturedParams, { id: "42" });
    });

    test("should resolve a route with multiple dynamic parameters", async () => {
        const router = makeFakeRouter();
        let capturedParams = null;

        router.addRoute("GET", "/users/{userId}/posts/{postId}", (req, res) => {
            capturedParams = req.params;
        });

        const kernel = makeKernel({ router });

        const rawReq = makeFakeIncomingMessage({ method: "GET", url: "/users/3/posts/77" });
        const { raw: rawRes } = makeFakeServerResponse();

        await kernel.handle(rawReq, rawRes);

        assert.deepEqual(capturedParams, { userId: "3", postId: "77" });
    });

});

// ---- handle() - Request & Response creation ----

describe("HttpKernel - handle() object creation", () => {

    test("handler should receive a Request instance as first argument", async () => {
        const router = makeFakeRouter();
        let capturedReq = null;

        router.addRoute("GET", "/", (req, res) => {
            capturedReq = req;
        });

        const kernel = makeKernel({ router });

        const rawReq = makeFakeIncomingMessage({ method: "GET", url: "/" });
        const { raw: rawRes } = makeFakeServerResponse();

        await kernel.handle(rawReq, rawRes);

        assert.ok(capturedReq instanceof Request);
    });

    test("handler should receive a Response instance as second argument", async () => {
        const router = makeFakeRouter();
        let capturedRes = null;

        router.addRoute("GET", "/", (req, res) => {
            capturedRes = res;
        });

        const kernel = makeKernel({ router });

        const rawReq = makeFakeIncomingMessage({ method: "GET", url: "/" });
        const { raw: rawRes } = makeFakeServerResponse();

        await kernel.handle(rawReq, rawRes);

        assert.ok(capturedRes instanceof Response);
    });

    test("Request should reflect the original raw method and url", async () => {
        const router = makeFakeRouter();
        let capturedReq = null;

        router.addRoute("POST", "/submit", (req, res) => {
            capturedReq = req;
        });

        const kernel = makeKernel({ router });

        const rawReq = makeFakeIncomingMessage({ method: "POST", url: "/submit" });
        const { raw: rawRes } = makeFakeServerResponse();

        await kernel.handle(rawReq, rawRes);

        assert.equal(capturedReq.method, "POST");
        assert.equal(capturedReq.url, "/submit");
    });

});

// ---- handle() - Pipeline behavior ----

describe("HttpKernel - handle() pipeline behavior", () => {

    test("same Request and Response instance should reach the handler consistently", async () => {
        const router = makeFakeRouter();
        let handlerReq = null;
        let handlerRes = null;

        router.addRoute("GET", "/", (req, res) => {
            handlerReq = req;
            handlerRes = res;
        });

        const kernel = makeKernel({ router });

        const rawReq = makeFakeIncomingMessage({ method: "GET", url: "/" });
        const { raw: rawRes } = makeFakeServerResponse();

        await kernel.handle(rawReq, rawRes);

        assert.ok(handlerReq instanceof Request);
        assert.ok(handlerRes instanceof Response);
    });

    test("handler return value should propagate through the kernel and normalize to response", async () => {
        const router = makeFakeRouter();

        router.addRoute("GET", "/", (req, res) => {
            return "handler-response";
        });

        const kernel = makeKernel({ router });

        const rawReq = makeFakeIncomingMessage({ method: "GET", url: "/" });
        const { raw: rawRes, calls } = makeFakeServerResponse();

        const result = await kernel.handle(rawReq, rawRes);

        assert.ok(result instanceof Response);
        assert.equal(calls.body, "handler-response");
    });

    test("each handle() call should use an independent pipeline (no cross-request state leakage)", async () => {
        const router = makeFakeRouter();
        const capturedReqs = [];

        router.addRoute("GET", "/a", (req) => { capturedReqs.push(req); });
        router.addRoute("GET", "/b", (req) => { capturedReqs.push(req); });

        const kernel = makeKernel({ router });

        const rawReqA = makeFakeIncomingMessage({ method: "GET", url: "/a" });
        const { raw: rawResA } = makeFakeServerResponse();
        await kernel.handle(rawReqA, rawResA);

        const rawReqB = makeFakeIncomingMessage({ method: "GET", url: "/b" });
        const { raw: rawResB } = makeFakeServerResponse();
        await kernel.handle(rawReqB, rawResB);

        assert.equal(capturedReqs.length, 2);
        assert.notStrictEqual(capturedReqs[0], capturedReqs[1]);
    });

});

// ---- handle() - Middleware interaction ----

describe("HttpKernel - handle() middleware interaction", () => {

    test("global middlewares should execute in order before the handler", async () => {
        const router = makeFakeRouter();
        const log = [];

        router.addRoute("GET", "/", (req, res) => {
            log.push("handler");
        });

        const m1 = (req, res, next) => { log.push("m1"); return next(); };
        const m2 = (req, res, next) => { log.push("m2"); return next(); };

        const kernel = makeKernel({
            router,
            middlewareResolver: makeMiddlewareResolver({ global: [m1, m2] })
        });

        const rawReq = makeFakeIncomingMessage({ method: "GET", url: "/" });
        const { raw: rawRes } = makeFakeServerResponse();

        await kernel.handle(rawReq, rawRes);

        assert.deepEqual(log, ["m1", "m2", "handler"]);
    });

    test("route-specific middleware should run after global middleware", async () => {
        const router = makeFakeRouter();
        const log = [];

        router.addRoute("GET", "/admin", (req, res) => {
            log.push("handler");
        });

        const logger = (req, res, next) => { log.push("logger"); return next(); };
        const auth = (req, res, next) => { log.push("auth"); return next(); };

        const kernel = makeKernel({
            router,
            middlewareResolver: makeMiddlewareResolver({
                global: [logger],
                route: [["GET", "/admin", auth]]
            })
        });

        const rawReq = makeFakeIncomingMessage({ method: "GET", url: "/admin" });
        const { raw: rawRes } = makeFakeServerResponse();

        await kernel.handle(rawReq, rawRes);

        assert.deepEqual(log, ["logger", "auth", "handler"]);
    });

    test("middleware should be able to short-circuit the pipeline", async () => {
        const router = makeFakeRouter();
        let handlerCalled = false;

        router.addRoute("GET", "/", (req, res) => {
            handlerCalled = true;
        });

        const blocker = (req, res, next) => {
            return res.status(403).json({ error: "blocked" });
        };

        const kernel = makeKernel({
            router,
            middlewareResolver: makeMiddlewareResolver({ global: [blocker] })
        });

        const rawReq = makeFakeIncomingMessage({ method: "GET", url: "/" });
        const { raw: rawRes, calls } = makeFakeServerResponse();

        const result = await kernel.handle(rawReq, rawRes);

        assert.equal(result.statusCode, 403);
        assert.equal(calls.body, JSON.stringify({ error: "blocked" }));
        assert.equal(handlerCalled, false);
    });

});

// ---- Error propagation ----

describe("HttpKernel - error propagation", () => {

    test("errors thrown in handler should bubble up", async () => {
        const router = makeFakeRouter();

        router.addRoute("GET", "/", (req, res) => {
            throw new Error("handler exploded");
        });

        const kernel = makeKernel({ router });

        const rawReq = makeFakeIncomingMessage({ method: "GET", url: "/" });
        const { raw: rawRes } = makeFakeServerResponse();

        await assert.rejects(
            async () => await kernel.handle(rawReq, rawRes),
            { message: "handler exploded" }
        );
    });

    test("errors thrown in async handler should reject returned promise and be caught by exceptionHandler", async () => {
        class CustomError extends Error {}
        let handledError = null;

        const exceptionHandler = {
            handle(err, req, res) {
                handledError = err;
                return res.status(400).json({ error: err.message });
            }
        };

        const router = makeFakeRouter();
        router.addRoute("POST", "/user", async () => {
            throw new CustomError("async validation failed");
        });

        const kernel = makeKernel({ router, exceptionHandler });
        const rawReq = makeFakeIncomingMessage({ method: "POST", url: "/user" });
        const { raw: rawRes } = makeFakeServerResponse();

        const result = await kernel.handle(rawReq, rawRes);
        assert.equal(result.statusCode, 400);
        assert.ok(handledError instanceof CustomError);
        assert.equal(handledError.message, "async validation failed");
    });

    test("RouteNotFoundError should carry method and path", async () => {
        const kernel = makeKernel();

        const rawReq = makeFakeIncomingMessage({ method: "GET", url: "/missing" });
        const { raw: rawRes } = makeFakeServerResponse();

        try {
            await kernel.handle(rawReq, rawRes);
            assert.fail("should have thrown");
        } catch (error) {
            assert.ok(error instanceof RouteNotFoundError);
            assert.equal(error.method, "GET");
            assert.equal(error.path, "/missing");
        }
    });

    test("RouteNotFoundError message should include method and path", async () => {
        const kernel = makeKernel();

        const rawReq = makeFakeIncomingMessage({ method: "DELETE", url: "/users/99" });
        const { raw: rawRes } = makeFakeServerResponse();

        await assert.rejects(
            async () => await kernel.handle(rawReq, rawRes),
            { message: "No route found for DELETE /users/99" }
        );
    });

});

// ---- Full integration ----

describe("HttpKernel - integration", () => {

    test("full flow: IncomingMessage → Request → Router → Pipeline → Handler → Response", async () => {
        const router = makeFakeRouter();
        const log = [];

        router.addRoute("GET", "/", (req, res) => {
            log.push("root-handler");
            return res.text("Hello ECF 🚀");
        });

        router.addRoute("GET", "/users/{id}", (req, res) => {
            log.push(`user-handler:${req.params.id}`);
            return res.json({ id: req.params.id });
        });

        router.addRoute("POST", "/users", (req, res) => {
            log.push("create-user");
            return res.status(201).json({ created: true });
        });

        const kernel = makeKernel({ router });

        const rawReq1 = makeFakeIncomingMessage({ method: "GET", url: "/" });
        const { raw: rawRes1, calls: calls1 } = makeFakeServerResponse();
        await kernel.handle(rawReq1, rawRes1);

        assert.equal(calls1.body, "Hello ECF 🚀");
        assert.equal(calls1.headers["content-type"], "text/plain; charset=utf-8");
        assert.deepEqual(log, ["root-handler"]);

        const rawReq2 = makeFakeIncomingMessage({ method: "GET", url: "/users/7" });
        const { raw: rawRes2, calls: calls2 } = makeFakeServerResponse();
        await kernel.handle(rawReq2, rawRes2);

        assert.equal(calls2.body, JSON.stringify({ id: "7" }));
        assert.equal(calls2.headers["content-type"], "application/json; charset=utf-8");
        assert.deepEqual(log, ["root-handler", "user-handler:7"]);

        const rawReq3 = makeFakeIncomingMessage({ method: "POST", url: "/users" });
        const { raw: rawRes3, calls: calls3 } = makeFakeServerResponse();
        await kernel.handle(rawReq3, rawRes3);

        assert.equal(calls3.body, JSON.stringify({ created: true }));
        assert.equal(rawRes3.statusCode, 201);
        assert.deepEqual(log, ["root-handler", "user-handler:7", "create-user"]);

        const rawReq4 = makeFakeIncomingMessage({ method: "GET", url: "/not-found" });
        const { raw: rawRes4 } = makeFakeServerResponse();

        await assert.rejects(
            async () => await kernel.handle(rawReq4, rawRes4),
            RouteNotFoundError
        );
    });

    test("integration with middlewares: global auth + logger + handler", async () => {
        const router = makeFakeRouter();
        const log = [];

        const auth = (req, res, next) => { log.push("auth"); return next(); };
        const logger = (req, res, next) => { log.push("logger"); return next(); };

        router.addRoute("GET", "/dashboard", (req, res) => {
            log.push("dashboard-handler");
            return res.json({ page: "dashboard" });
        });

        const kernel = makeKernel({
            router,
            middlewareResolver: makeMiddlewareResolver({ global: [auth, logger] })
        });

        const rawReq = makeFakeIncomingMessage({ method: "GET", url: "/dashboard" });
        const { raw: rawRes, calls } = makeFakeServerResponse();

        await kernel.handle(rawReq, rawRes);

        assert.deepEqual(log, ["auth", "logger", "dashboard-handler"]);
        assert.equal(calls.body, JSON.stringify({ page: "dashboard" }));
    });

    test("should pass responseContext to Response instance", async () => {
        const router = makeFakeRouter();
        let capturedContext = null;

        router.addRoute("GET", "/view", (req, res) => {
            capturedContext = res.context;
        });

        const fakeView = { render: async () => "test" };
        const kernel = makeKernel({ router, responseContext: { view: fakeView } });

        const rawReq = makeFakeIncomingMessage({ method: "GET", url: "/view" });
        const { raw: rawRes } = makeFakeServerResponse();

        await kernel.handle(rawReq, rawRes);

        assert.equal(capturedContext.view, fakeView);
    });

});