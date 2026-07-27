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

describe("Stack & Once Directives (@push, @prepend, @stack, @once)", () => {
    it("renders @push and @stack", () => {
        const loader = new MemoryLoader();
        loader.set("layout", "Head: @stack('scripts')");
        loader.set("page", "@extends('layout') @push('scripts') <script src='a.js'></script> @endpush @push('scripts') <script src='b.js'></script> @endpush");
        const vm = createViewManager(loader);

        const html = vm.renderSync("page");
        assert.equal(html, "Head:  <script src='a.js'></script>  <script src='b.js'></script> ");
    });

    it("renders @prepend to place content at the beginning of a stack", () => {
        const loader = new MemoryLoader();
        loader.set("layout", "Scripts: @stack('scripts')");
        loader.set("page", "@extends('layout') @push('scripts') 2 @endpush @prepend('scripts') 1 @endprepend");
        const vm = createViewManager(loader);

        const html = vm.renderSync("page");
        assert.equal(html, "Scripts:  1  2 ");
    });

    it("evaluates @once directive only once per render context", () => {
        const loader = new MemoryLoader();
        loader.set("component", "@once <style>.btn{color:red;}</style> @endonce <button>Click</button>");
        loader.set("page", "@include('component') @include('component')");
        const vm = createViewManager(loader);

        const html = vm.renderSync("page");
        assert.equal(html, " <style>.btn{color:red;}</style>  <button>Click</button>  <button>Click</button>");
    });
});
