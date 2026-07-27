import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import Pipeline from "../src/Pipeline.js";
import PipelineError from "../src/errors/PipelineError.js";
import Request from "../src/Request.js";
import Response from "../src/Response.js";
import Middleware from "../src/Middleware.js";


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
    const calls = { headers: {}, body: null, ended: false };
    const raw = {
        headersSent: false,
        statusCode: 200,
        setHeader(name, value) { calls.headers[name.toLowerCase()] = value; },
        getHeader(name) { return calls.headers[name.toLowerCase()]; },
        removeHeader(name) { delete calls.headers[name.toLowerCase()]; },
        end(body) {
            calls.ended = true;
            calls.body = body ?? null;
            raw.headersSent = true;
        }
    };
    return { raw, calls };
}

function makeFakeBodyParserManager(returnValue = {}) {
    return { parse: async () => returnValue };
}

function makeRequest(overrides = {}) {
    return new Request(makeFakeIncomingMessage(overrides), makeFakeBodyParserManager());
}

function makeResponse() {
    const { raw } = makeFakeServerResponse();
    return new Response(raw);
}

// ---- Tests ----

describe("Pipeline - send()", () => {

    test("should accept a valid Request and Response instance", () => {
        const pipeline = new Pipeline();
        assert.doesNotThrow(() => pipeline.send(makeRequest(), makeResponse()));
    });

    test("should return the pipeline instance for chaining", () => {
        const pipeline = new Pipeline();
        const result = pipeline.send(makeRequest(), makeResponse());
        assert.strictEqual(result, pipeline);
    });

    test("should throw PipelineError for null request", () => {
        const pipeline = new Pipeline();
        assert.throws(() => pipeline.send(null, makeResponse()), PipelineError);
    });

    test("should accept plain objects as passable data (generic pipeline)", () => {
        const pipeline = new Pipeline();
        assert.doesNotThrow(() => pipeline.send({}, {}));
    });

    test("should throw PipelineError for null response", () => {
        const pipeline = new Pipeline();
        assert.throws(() => pipeline.send(makeRequest(), null), PipelineError);
    });

});

describe("Pipeline - through()", () => {

    test("should accept a valid middleware array", () => {
        const pipeline = new Pipeline();
        assert.doesNotThrow(() => pipeline.through([() => {}, () => {}]));
    });

    test("should return the pipeline instance for chaining", () => {
        const pipeline = new Pipeline();
        const result = pipeline.through([]);
        assert.strictEqual(result, pipeline);
    });

    test("should throw PipelineError for null", () => {
        const pipeline = new Pipeline();
        assert.throws(() => pipeline.through(null), PipelineError);
    });

    test("should throw PipelineError for a plain object", () => {
        const pipeline = new Pipeline();
        assert.throws(() => pipeline.through({}), PipelineError);
    });

    test("should throw PipelineError if any element is not a function", () => {
        const pipeline = new Pipeline();
        assert.throws(() => pipeline.through([() => {}, {}, () => {}]), PipelineError);
    });

});

describe("Pipeline - then()", () => {

    test("should throw PipelineError for null destination", () => {
        const pipeline = new Pipeline();
        pipeline.send(makeRequest(), makeResponse()).through([]);

        assert.throws(() => pipeline.then(null), PipelineError);
    });

    test("should throw PipelineError if send() was not called before then()", () => {
        const pipeline = new Pipeline();
        assert.throws(() => pipeline.then(() => {}), PipelineError);
    });

    test("should execute the destination and return its result", () => {
        const pipeline = new Pipeline();

        const result = pipeline
            .send(makeRequest(), makeResponse())
            .through([])
            .then((req, res) => "destination-result");

        assert.equal(result, "destination-result");
    });

});

describe("Pipeline - execution", () => {

    test("empty middleware array should call destination directly", () => {
        const pipeline = new Pipeline();
        let called = false;

        pipeline
            .send(makeRequest(), makeResponse())
            .through([])
            .then((req, res) => { called = true; });

        assert.equal(called, true);
    });

    test("middleware execution order should be preserved", () => {
        const pipeline = new Pipeline();
        const order = [];

        const m1 = (req, res, next) => { order.push(1); return next(); };
        const m2 = (req, res, next) => { order.push(2); return next(); };
        const m3 = (req, res, next) => { order.push(3); return next(); };

        pipeline
            .send(makeRequest(), makeResponse())
            .through([m1, m2, m3])
            .then((req, res) => { order.push("destination"); });

        assert.deepEqual(order, [1, 2, 3, "destination"]);
    });

    test("same Request and Response instance should be passed to every middleware and destination", () => {
        const pipeline = new Pipeline();
        const request = makeRequest();
        const response = makeResponse();
        const reqInstances = [];
        const resInstances = [];

        const m1 = (req, res, next) => { reqInstances.push(req); resInstances.push(res); return next(); };
        const m2 = (req, res, next) => { reqInstances.push(req); resInstances.push(res); return next(); };

        pipeline
            .send(request, response)
            .through([m1, m2])
            .then((req, res) => { reqInstances.push(req); resInstances.push(res); });

        assert.equal(reqInstances.length, 3);
        assert.ok(reqInstances.every((r) => r === request));
        assert.ok(resInstances.every((r) => r === response));
    });

    test("middleware should be able to run code before and after next()", () => {
        const pipeline = new Pipeline();
        const log = [];

        const middleware = (req, res, next) => {
            log.push("before");
            const result = next();
            log.push("after");
            return result;
        };

        pipeline
            .send(makeRequest(), makeResponse())
            .through([middleware])
            .then((req, res) => { log.push("destination"); return "result"; });

        assert.deepEqual(log, ["before", "destination", "after"]);
    });

    test("return value should propagate from destination through middleware to caller", () => {
        const pipeline = new Pipeline();

        const m1 = (req, res, next) => next();
        const m2 = (req, res, next) => next();

        const result = pipeline
            .send(makeRequest(), makeResponse())
            .through([m1, m2])
            .then((req, res) => "final-response");

        assert.equal(result, "final-response");
    });

    test("middleware can short-circuit by not calling next()", () => {
        const pipeline = new Pipeline();
        let destinationCalled = false;

        const blocker = (req, res, next) => {
            return "blocked";
        };

        const result = pipeline
            .send(makeRequest(), makeResponse())
            .through([blocker])
            .then((req, res) => { destinationCalled = true; });

        assert.equal(result, "blocked");
        assert.equal(destinationCalled, false);
    });

});

describe("Pipeline - error propagation", () => {

    test("exceptions in middleware should bubble up (Pipeline does not catch)", () => {
        const pipeline = new Pipeline();

        const explodingMiddleware = (req, res, next) => {
            throw new Error("middleware exploded");
        };

        assert.throws(
            () => {
                pipeline
                    .send(makeRequest(), makeResponse())
                    .through([explodingMiddleware])
                    .then((req, res) => "should-not-reach");
            },
            { message: "middleware exploded" }
        );
    });

    test("exceptions in destination should bubble up through middleware", () => {
        const pipeline = new Pipeline();

        const passThroughMiddleware = (req, res, next) => next();

        assert.throws(
            () => {
                pipeline
                    .send(makeRequest(), makeResponse())
                    .through([passThroughMiddleware])
                    .then((req, res) => { throw new Error("destination exploded"); });
            },
            { message: "destination exploded" }
        );
    });

});

describe("Pipeline - fluent API", () => {

    test("full fluent chain should work end-to-end", () => {
        const log = [];

        const auth = (req, res, next) => { log.push("auth"); return next(); };
        const logger = (req, res, next) => { log.push("logger"); return next(); };

        const result = new Pipeline()
            .send(makeRequest(), makeResponse())
            .through([auth, logger])
            .then((req, res) => {
                log.push("handler");
                return "response";
            });

        assert.deepEqual(log, ["auth", "logger", "handler"]);
        assert.equal(result, "response");
    });

});

describe("Pipeline - class-based middleware", () => {

    test("should execute a Middleware subclass instance via handle()", () => {
        const pipeline = new Pipeline();
        const log = [];

        class Logger extends Middleware {
            handle(request, response, next) {
                log.push("logger-class");
                return next();
            }
        }

        pipeline
            .send(makeRequest(), makeResponse())
            .through([new Logger()])
            .then((req, res) => { log.push("destination"); });

        assert.deepEqual(log, ["logger-class", "destination"]);
    });

    test("should support mixing function and class-based middleware in the same chain", () => {
        const pipeline = new Pipeline();
        const log = [];

        const fnMiddleware = (req, res, next) => { log.push("fn"); return next(); };

        class ClassMiddleware extends Middleware {
            handle(request, response, next) {
                log.push("class");
                return next();
            }
        }

        pipeline
            .send(makeRequest(), makeResponse())
            .through([fnMiddleware, new ClassMiddleware()])
            .then((req, res) => { log.push("destination"); });

        assert.deepEqual(log, ["fn", "class", "destination"]);
    });

    test("through() should throw PipelineError if array contains neither function nor Middleware instance", () => {
        const pipeline = new Pipeline();
        assert.throws(() => pipeline.through([{}]), PipelineError);
    });

});