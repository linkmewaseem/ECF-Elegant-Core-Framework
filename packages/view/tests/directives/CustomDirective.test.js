import { describe, it } from "node:test";
import assert from "node:assert/strict";
import ViewManager from "../../src/manager/ViewManager.js";
import Compiler from "../../src/Compiler.js";
import Renderer from "../../src/renderer/Renderer.js";

class MemoryLoader {
    constructor() {
        this.views = new Map();
    }
    set(name, source) {
        this.views.set(name, source);
    }
    async load(filePath) { return this.loadSync(filePath); }
    loadSync(filePath) {
        const source = this.views.get(filePath) ?? "";
        return { id: filePath, path: filePath, source, extension: ".ecf", lastModified: Date.now() };
    }
    async exists(filePath) { return this.views.has(filePath); }
    existsSync(filePath) { return this.views.has(filePath); }
}

function createViewManager(loader) {
    const compiler = new Compiler();
    const renderer = new Renderer();
    const finder = {
        exists: (name) => loader.views.has(name),
        find: (name) => name
    };
    return new ViewManager(loader, compiler, renderer, { finder });
}

describe("Custom Directive System", () => {
    it("registers and renders custom directive @datetime", () => {
        const loader = new MemoryLoader();
        loader.set("test.ecf", "Created at: @datetime(user.createdAt)");
        const vm = createViewManager(loader);

        vm.directive("datetime", (val) => `<time>${val}</time>`);

        const html = vm.renderSync("test.ecf", { user: { createdAt: "2026-07-27" } });
        assert.equal(html, "Created at: <time>2026-07-27</time>");
    });

    it("registers bare custom directive without arguments", () => {
        const loader = new MemoryLoader();
        loader.set("test.ecf", "Current year: @currentYear");
        const vm = createViewManager(loader);

        vm.directive("currentYear", () => "2026");

        const html = vm.renderSync("test.ecf");
        assert.equal(html, "Current year: 2026");
    });

    it("throws ViewError when executing an unregistered custom directive", () => {
        const loader = new MemoryLoader();
        loader.set("test.ecf", "Custom: @unknownDirective(123)");
        const vm = createViewManager(loader);

        assert.throws(() => {
            vm.renderSync("test.ecf");
        }, /Unknown custom directive: @unknownDirective/);
    });

    it("allows chaining multiple directive registrations", () => {
        const loader = new MemoryLoader();
        loader.set("test.ecf", "@foo - @bar");
        const vm = createViewManager(loader);

        vm.directive("foo", () => "FOO").directive("bar", () => "BAR");

        const html = vm.renderSync("test.ecf");
        assert.equal(html, "FOO - BAR");
    });
});
