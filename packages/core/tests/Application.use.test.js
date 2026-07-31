import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import Application from "../src/Application.js";
import ServiceProvider from "../src/ServiceProvider.js";

class MockMiddlewareRegistry {
    constructor() {
        this.globalStack = [];
    }
    global(middleware) {
        this.globalStack.push(middleware);
    }
    getGlobal() {
        return this.globalStack;
    }
}

class MockMiddlewareServiceProvider extends ServiceProvider {
    register(app) {
        app.singleton("middleware.registry", () => new MockMiddlewareRegistry());
    }
    boot() {}
}

let app;

function bootApp() {
    app = new Application();
    app.register(MockMiddlewareServiceProvider);
    app.boot();
    return app;
}

describe("Application.use() - unit contract", () => {

    beforeEach(() => {
        bootApp();
    });

    test("app.use() should return the Application instance for chaining", () => {
        const result = app.use((req, res, next) => next());
        assert.strictEqual(result, app);
    });

    test("app.use() should register middleware into the middleware.registry service", () => {
        const fn = (req, res, next) => next();
        app.use(fn);

        const registry = app.make("middleware.registry");
        assert.deepEqual(registry.getGlobal(), [fn]);
    });

});