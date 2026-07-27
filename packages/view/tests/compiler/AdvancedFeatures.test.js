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

describe("v1.0 Advanced View Engine Features", () => {
    describe("Escaping System", () => {
        it("escapes HTML in standard {{ }} interpolation", () => {
            const loader = new MemoryLoader();
            loader.set("test", "{{ bio }}");
            const vm = createViewManager(loader);

            const html = vm.renderSync("test", { bio: "<script>alert('xss')</script>" });
            assert.equal(html, "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
        });

        it("renders raw unescaped HTML in {!! !!} interpolation", () => {
            const loader = new MemoryLoader();
            loader.set("test", "{!! bio !!}");
            const vm = createViewManager(loader);

            const html = vm.renderSync("test", { bio: "<strong>Bold Text</strong>" });
            assert.equal(html, "<strong>Bold Text</strong>");
        });
    });

    describe("Fragment Cache (@cache / @endcache)", () => {
        it("caches fragment rendered output across render calls", () => {
            const loader = new MemoryLoader();
            loader.set("test", "@cache('sidebar') Count: {{ count }} @endcache");
            const vm = createViewManager(loader);

            const html1 = vm.renderSync("test", { count: 1 });
            assert.equal(html1, " Count: 1 ");

            // Second render with different count returns cached content!
            const html2 = vm.renderSync("test", { count: 2 });
            assert.equal(html2, " Count: 1 ");
        });

        it("clears fragment cache via forgetFragmentCache()", () => {
            const loader = new MemoryLoader();
            loader.set("test", "@cache('stats') {{ val }} @endcache");
            const vm = createViewManager(loader);

            vm.renderSync("test", { val: "A" });
            vm.forgetFragmentCache("stats");
            const html = vm.renderSync("test", { val: "B" });
            assert.equal(html, " B ");
        });
    });

    describe("Built-in Directives & Helpers", () => {
        it("renders @csrf directive", () => {
            const loader = new MemoryLoader();
            loader.set("form", "@csrf");
            const vm = createViewManager(loader);

            const html = vm.renderSync("form", { _token: "secret123" });
            assert.equal(html, '<input type="hidden" name="_token" value="secret123">');
        });

        it("renders @method directive", () => {
            const loader = new MemoryLoader();
            loader.set("form", "@method('PUT')");
            const vm = createViewManager(loader);

            const html = vm.renderSync("form");
            assert.equal(html, '<input type="hidden" name="_method" value="PUT">');
        });

        it("renders @asset directive", () => {
            const loader = new MemoryLoader();
            loader.set("test", "@asset('css/app.css')");
            const vm = createViewManager(loader);

            const html = vm.renderSync("test");
            assert.equal(html, "/assets/css/app.css");
        });
    });

    describe("Dynamic & Alias Component System", () => {
        it("renders component via component alias", () => {
            const loader = new MemoryLoader();
            loader.set("components.btn", "<button>Aliased Button</button>");
            loader.set("page", "<x-button />");
            const vm = createViewManager(loader);
            vm.component("button", "components.btn");

            const html = vm.renderSync("page");
            assert.equal(html, "<button>Aliased Button</button>");
        });

        it("renders dynamic component (<x-dynamic :component='target' />)", () => {
            const loader = new MemoryLoader();
            loader.set("components.card", "<div class='card'>Card Content</div>");
            loader.set("page", "<x-dynamic :component='target' />");
            const vm = createViewManager(loader);

            const html = vm.renderSync("page", { target: "card" });
            assert.equal(html, "<div class='card'>Card Content</div>");
        });

        it("resolves namespaced component (<x-admin::sidebar />)", () => {
            const loader = new MemoryLoader();
            loader.set("admin::components.sidebar", "<aside>Admin Sidebar</aside>");
            loader.set("page", "<x-admin::sidebar />");
            const vm = createViewManager(loader);

            const html = vm.renderSync("page");
            assert.equal(html, "<aside>Admin Sidebar</aside>");
        });
    });
});
