import { describe, test } from "node:test";
import assert from "node:assert/strict";
import HttpKernel from "../src/HttpKernel.js";
import Router from "../src/Router.js";
import Middleware from "../src/Middleware.js";
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

function makeFakeBodyParserManager() { return { parse: async () => ({}) }; }

describe("HttpKernel - Terminating Middleware Lifecycle Hook", () => {

    test("executes terminate() on middleware AFTER response has been sent", async () => {
        const events = [];
        const router = new Router();

        class AuditLoggerMiddleware extends Middleware {
            async handle(req, res, next) {
                events.push("handle-start");
                const response = await next(req, res);
                events.push("handle-end");
                return response;
            }

            async terminate(req, res) {
                events.push(`terminate-${res.statusCode}`);
            }
        }

        const auditMw = new AuditLoggerMiddleware();
        router.get("/", auditMw, (req, res) => {
            events.push("controller");
            return "hello world";
        });

        const resolver = {
            resolve: (route) => router.getMetadata("GET", route.path).middleware
        };

        const kernel = new HttpKernel(router, makeFakeBodyParserManager(), resolver);

        const rawReq = makeFakeIncomingMessage();
        const rawRes = makeFakeServerResponse();

        const res = await kernel.handle(rawReq, rawRes);

        assert.equal(res.statusCode, 200);
        assert.equal(rawRes.headersSent, true);
        assert.deepEqual(events, [
            "handle-start",
            "controller",
            "handle-end",
            "terminate-200"
        ]);
    });

    test("isolated termination errors do not break response delivery to client", async () => {
        const router = new Router();
        let reportedError = null;

        class BrokenTerminator extends Middleware {
            async handle(req, res, next) {
                return await next(req, res);
            }
            async terminate(req, res) {
                throw new Error("Termination Log Failed");
            }
        }

        router.get("/", new BrokenTerminator(), (req, res) => "ok response");

        const resolver = { resolve: (r) => router.getMetadata("GET", r.path).middleware };
        const exceptionHandler = {
            handle: (e, req, res) => res.status(500).json({ error: e.message }),
            report: (err) => { reportedError = err; }
        };

        const kernel = new HttpKernel(router, makeFakeBodyParserManager(), resolver, exceptionHandler);

        const rawReq = makeFakeIncomingMessage();
        const rawRes = makeFakeServerResponse();

        const res = await kernel.handle(rawReq, rawRes);

        assert.equal(res.statusCode, 200);
        assert.equal(rawRes.body, "ok response");
        assert.equal(reportedError?.message, "Termination Log Failed");
    });
});
