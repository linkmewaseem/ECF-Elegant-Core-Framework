import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import Application from "../src/Application.js";
import ServiceProvider from "../src/ServiceProvider.js";
import ContainerError from "../src/errors/ContainerError.js";

class MockHttpServiceProvider extends ServiceProvider {
    register(app) {
        app.registerListenHandler((appInstance, args) => {
            const [portOrOptions, callback] = args;
            if (portOrOptions === -1) {
                const err = new Error("Invalid port");
                err.name = "HttpServerError";
                throw err;
            }
            if (typeof callback === "function") {
                callback();
            }
        });
    }
    boot() {}
}

let app;

function bootApp() {
    app = new Application();
    app.register(MockHttpServiceProvider);
    app.boot();
    return app;
}

describe("Application.listen() - unit contract", () => {

    beforeEach(() => {
        bootApp();
    });

    test("app.listen() should throw ContainerError if no listen handler is registered", () => {
        const rawApp = new Application();
        assert.throws(() => rawApp.listen(3000), ContainerError);
    });

    test("app.listen() should return the Application instance for chaining", () => {
        const result = app.listen(0);
        assert.strictEqual(result, app);
    });


    test("app.listen(-1) should bubble up error thrown by listen handler", () => {
        assert.throws(() => app.listen(-1), (err) => err.name === "HttpServerError");
    });

    test("app.registerListenHandler() should validate handler is a function", () => {
        const testApp = new Application();
        assert.throws(() => testApp.registerListenHandler("invalid"), ContainerError);
    });

});