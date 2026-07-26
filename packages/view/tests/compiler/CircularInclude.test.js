import { describe, test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import ViewManager from "../../src/manager/ViewManager.js";
import Compiler from "../../src/Compiler.js";
import Renderer from "../../src/renderer/Renderer.js";
import ViewError from "../../src/errors/ViewError.js";

class MemoryLoader {
    constructor(views = {}) {
        this.views = new Map();
        for (const [key, val] of Object.entries(views)) {
            const norm = key.split("/").join(path.sep);
            this.views.set(norm, val);
        }
    }

    normalize(filePath) {
        return filePath.split("/").join(path.sep);
    }

    async load(filePath) {
        const norm = this.normalize(filePath);
        if (!this.views.has(norm)) throw new Error(`Not found: ${filePath}`);
        return { id: norm, path: norm, source: this.views.get(norm), extension: ".ecf", lastModified: Date.now() };
    }

    loadSync(filePath) {
        const norm = this.normalize(filePath);
        if (!this.views.has(norm)) throw new Error(`Not found: ${filePath}`);
        return { id: norm, path: norm, source: this.views.get(norm), extension: ".ecf", lastModified: Date.now() };
    }

    exists(filePath) { return this.views.has(this.normalize(filePath)); }
    existsSync(filePath) { return this.views.has(this.normalize(filePath)); }
}

function createViewManager(views = {}) {
    const loader = new MemoryLoader(views);
    return new ViewManager(loader, new Compiler(), new Renderer(), { basePath: "" });
}

describe("Circular Include & Depth Protection", () => {
    test("detects direct self circular include (A -> A)", () => {
        const vm = createViewManager({
            "a.ecf": `<div>@include('a')</div>`
        });

        assert.throws(
            () => vm.renderSync("a"),
            (err) => err instanceof ViewError && err.message.includes("Circular include detected")
        );
    });

    test("detects indirect circular include (A -> B -> A)", () => {
        const vm = createViewManager({
            "a.ecf": `@include('b')`,
            "b.ecf": `@include('a')`
        });

        assert.throws(
            () => vm.renderSync("a"),
            (err) => err instanceof ViewError && err.message.includes("Circular include detected: a -> b -> a")
        );
    });

    test("detects circular layout extends (A extends B, B extends A)", () => {
        const vm = createViewManager({
            "a.ecf": `@extends('b')`,
            "b.ecf": `@extends('a')`
        });

        assert.throws(
            () => vm.renderSync("a"),
            (err) => err instanceof ViewError && err.message.includes("Circular include detected")
        );
    });

    test("throws error when max include depth limit (100) is exceeded", () => {
        const views = {};
        for (let i = 0; i < 110; i++) {
            views[`v${i}.ecf`] = `@include('v${i + 1}')`;
        }
        views["v110.ecf"] = "end";

        const vm = createViewManager(views);

        assert.throws(
            () => vm.renderSync("v0"),
            (err) => err instanceof ViewError && err.message.includes("Maximum include depth exceeded (100)")
        );
    });
});
