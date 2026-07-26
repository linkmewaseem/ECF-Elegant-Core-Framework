import { describe, test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import ViewManager from "../../src/manager/ViewManager.js";
import Compiler from "../../src/Compiler.js";
import Renderer from "../../src/renderer/Renderer.js";

class MemoryLoader {
    constructor(views = {}) {
        this.views = new Map();
        for (const [key, val] of Object.entries(views)) {
            const normalizedKey = key.split("/").join(path.sep);
            this.views.set(normalizedKey, val);
        }
    }

    normalize(filePath) {
        return filePath.split("/").join(path.sep);
    }

    async load(filePath) {
        const norm = this.normalize(filePath);
        if (!this.views.has(norm)) {
            throw new Error(`View file not found: ${filePath}`);
        }
        return {
            id: norm,
            path: norm,
            source: this.views.get(norm),
            extension: ".ecf",
            lastModified: Date.now()
        };
    }

    loadSync(filePath) {
        const norm = this.normalize(filePath);
        if (!this.views.has(norm)) {
            throw new Error(`View file not found: ${filePath}`);
        }
        return {
            id: norm,
            path: norm,
            source: this.views.get(norm),
            extension: ".ecf",
            lastModified: Date.now()
        };
    }

    exists(filePath) {
        return this.views.has(this.normalize(filePath));
    }

    existsSync(filePath) {
        return this.views.has(this.normalize(filePath));
    }
}

function createViewManager(views = {}) {
    const loader = new MemoryLoader(views);
    const compiler = new Compiler();
    const renderer = new Renderer();
    return new ViewManager(loader, compiler, renderer, { basePath: "" });
}

describe("Layout & Composition System", () => {
    test("basic @extends and @yield rendering", () => {
        const vm = createViewManager({
            "layouts/app.ecf": `<html><head><title>@yield('title')</title></head><body>@yield('content')</body></html>`,
            "home.ecf": `@extends('layouts/app') @section('title')Home Page@endsection @section('content')<h1>Welcome</h1>@endsection`
        });

        const html = vm.renderSync("home");
        assert.equal(html, "<html><head><title>Home Page</title></head><body><h1>Welcome</h1></body></html>");
    });

    test("fallback default content for @yield when section is omitted", () => {
        const vm = createViewManager({
            "layouts/app.ecf": `<title>@yield('title', 'Default Title')</title>`,
            "page.ecf": `@extends('layouts/app')`
        });

        const html = vm.renderSync("page");
        assert.equal(html, "<title>Default Title</title>");
    });

    test("inline @section('key', 'value') definition", () => {
        const vm = createViewManager({
            "layouts/app.ecf": `<h1>@yield('title')</h1>`,
            "page.ecf": `@extends('layouts/app') @section('title', 'Inline Title')`
        });

        const html = vm.renderSync("page");
        assert.equal(html, "<h1>Inline Title</h1>");
    });

    test("@section with @show yields content immediately in layout", () => {
        const vm = createViewManager({
            "layouts/app.ecf": `<aside>@section('sidebar')Default Sidebar@show</aside>`,
            "page.ecf": `@extends('layouts/app') @section('sidebar')Custom Sidebar@endsection`
        });

        const html = vm.renderSync("page");
        assert.equal(html, "<aside>Custom Sidebar</aside>");
    });

    test("@parent merges parent section content", () => {
        const vm = createViewManager({
            "layouts/app.ecf": `@section('sidebar')Base Links | @show`,
            "page.ecf": `@extends('layouts/app') @section('sidebar')@parent Page Links@endsection`
        });

        const html = vm.renderSync("page");
        assert.equal(html, "Base Links |  Page Links");
    });

    test("multi-level layout inheritance (child -> app -> base)", () => {
        const vm = createViewManager({
            "base.ecf": `[BaseTop] @yield('body') [BaseBottom]`,
            "app.ecf": `@extends('base') @section('body')<main>@yield('content')</main>@endsection`,
            "dashboard.ecf": `@extends('app') @section('content')<h1>Dashboard</h1>@endsection`
        });

        const html = vm.renderSync("dashboard");
        assert.equal(html, "[BaseTop] <main><h1>Dashboard</h1></main> [BaseBottom]");
    });
});
