import { describe, test } from "node:test";
import assert from "node:assert/strict";
import HttpKernel from "../src/HttpKernel.js";

function makeFakeRouter() { return { match: () => ({ handler: () => "ok" }) }; }
function makeFakeBodyParserManager() { return { parse: async () => ({}) }; }
function makeFakeMiddlewareResolver() { return { resolve: () => [] }; }

describe("HttpKernel - Application Bootstrap", () => {
    test("bootstrap() should execute application boot exactly once", async () => {
        let bootCount = 0;
        const fakeApp = {
            isBooted: false,
            boot: async () => { bootCount++; fakeApp.isBooted = true; }
        };

        const kernel = new HttpKernel(makeFakeRouter(), makeFakeBodyParserManager(), makeFakeMiddlewareResolver(), null, {}, fakeApp);

        assert.equal(kernel.isBootstrapped, false);

        await kernel.bootstrap();
        assert.equal(kernel.isBootstrapped, true);
        assert.equal(bootCount, 1);

        // Second call to bootstrap() does NOT re-execute boot()
        await kernel.bootstrap();
        assert.equal(bootCount, 1);
    });

    test("handle() should automatically trigger bootstrap() on first request", async () => {
        let bootCount = 0;
        const fakeApp = {
            isBooted: false,
            boot: async () => { bootCount++; fakeApp.isBooted = true; }
        };

        const rawReq = { method: "GET", url: "/", headers: {} };
        const rawRes = { statusCode: 200, headersSent: false, setHeader() {}, getHeader() {}, removeHeader() {}, end() {} };

        const kernel = new HttpKernel(makeFakeRouter(), makeFakeBodyParserManager(), makeFakeMiddlewareResolver(), null, {}, fakeApp);

        assert.equal(kernel.isBootstrapped, false);
        await kernel.handle(rawReq, rawRes);
        assert.equal(kernel.isBootstrapped, true);
        assert.equal(bootCount, 1);
    });
});
