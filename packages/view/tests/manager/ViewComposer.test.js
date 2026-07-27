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

describe("View Composers & Shared Data", () => {
    it("shares data globally across all view renders", () => {
        const loader = new MemoryLoader();
        loader.set("home.ecf", "Welcome to {{ appName }}");
        const vm = createViewManager(loader);
        vm.share("appName", "ECF Framework");

        const html = vm.renderSync("home.ecf");
        assert.equal(html, "Welcome to ECF Framework");
    });

    it("applies wildcard composer to all views (*)", () => {
        const loader = new MemoryLoader();
        loader.set("page.ecf", "Status: {{ globalVar }}");
        const vm = createViewManager(loader);
        vm.composer("*", ({ data }) => {
            data.globalVar = "ACTIVE";
        });

        const html = vm.renderSync("page.ecf");
        assert.equal(html, "Status: ACTIVE");
    });

    it("applies pattern composer (users.*)", () => {
        const loader = new MemoryLoader();
        loader.set("users.profile", "Area: {{ userSection }}");
        loader.set("admin.dashboard", "Area: {{ userSection }}");
        const vm = createViewManager(loader);

        vm.composer("users.*", ({ data }) => {
            data.userSection = "USER_AREA";
        });

        const userHtml = vm.renderSync("users.profile");
        assert.equal(userHtml, "Area: USER_AREA");

        const adminHtml = vm.renderSync("admin.dashboard");
        assert.equal(adminHtml, "Area: ");
    });
});
