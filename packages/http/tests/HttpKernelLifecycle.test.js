import { describe, test } from "node:test";
import assert from "node:assert/strict";
import HttpKernel from "../src/HttpKernel.js";
import Router from "../src/Router.js";
import Response from "../src/Response.js";
import { Readable } from "node:stream";

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

describe("HttpKernel - Full Request Lifecycle & Pipeline Integration", () => {

    test("executes complete lifecycle in exact order (Global MW -> Route -> Route MW -> Controller)", async () => {
        const order = [];
        const router = new Router();

        const globalMw1 = async (req, res, next) => { order.push("global1-start"); const r = await next(req, res); order.push("global1-end"); return r; };
        const globalMw2 = async (req, res, next) => { order.push("global2-start"); const r = await next(req, res); order.push("global2-end"); return r; };
        const routeMw1 = async (req, res, next) => { order.push("route1-start"); const r = await next(req, res); order.push("route1-end"); return r; };

        router.get("/dashboard", routeMw1, (req, res) => {
            order.push("controller");
            return "dashboard page";
        });

        const resolver = {
            resolve: (route) => router.getMetadata("GET", route.path).middleware
        };

        const kernel = new HttpKernel(router, makeFakeBodyParserManager(), resolver);
        kernel.use(globalMw1, globalMw2);

        const rawReq = makeFakeIncomingMessage({ url: "/dashboard" });
        const rawRes = makeFakeServerResponse();

        const res = await kernel.handle(rawReq, rawRes);

        assert.equal(res.statusCode, 200);
        assert.equal(rawRes.body, "dashboard page");
        assert.deepEqual(order, [
            "global1-start",
            "global2-start",
            "route1-start",
            "controller",
            "route1-end",
            "global2-end",
            "global1-end"
        ]);
    });

    test("global middleware can short-circuit request before route resolution", async () => {
        const router = new Router();
        let controllerCalled = false;

        router.get("/blocked", () => { controllerCalled = true; return "ok"; });

        const maintenanceMw = async (req, res, next) => {
            return res.status(503).json({ message: "Service Maintenance" });
        };

        const resolver = { resolve: () => [] };
        const kernel = new HttpKernel(router, makeFakeBodyParserManager(), resolver);
        kernel.use(maintenanceMw);

        const rawReq = makeFakeIncomingMessage({ url: "/blocked" });
        const rawRes = makeFakeServerResponse();

        const res = await kernel.handle(rawReq, rawRes);

        assert.equal(res.statusCode, 503);
        assert.equal(controllerCalled, false);
    });

    test("catches controller error and routes through exception handler", async () => {
        const router = new Router();
        router.get("/error", () => { throw new Error("Controller Boom"); });

        let exceptionReported = false;
        const exceptionHandler = {
            handle: (err, req, res) => {
                exceptionReported = true;
                return res.status(500).json({ error: err.message });
            }
        };

        const resolver = { resolve: () => [] };
        const kernel = new HttpKernel(router, makeFakeBodyParserManager(), resolver, exceptionHandler);

        const rawReq = makeFakeIncomingMessage({ url: "/error" });
        const rawRes = makeFakeServerResponse();

        const res = await kernel.handle(rawReq, rawRes);

        assert.equal(res.statusCode, 500);
        assert.equal(exceptionReported, true);
        assert.equal(rawRes.body, JSON.stringify({ error: "Controller Boom" }));
    });
});
