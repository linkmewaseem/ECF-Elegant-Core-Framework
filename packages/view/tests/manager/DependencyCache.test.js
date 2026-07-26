import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import ViewManager from "../../src/manager/ViewManager.js";
import ViewLoader from "../../src/loader/ViewLoader.js";
import Compiler from "../../src/Compiler.js";
import Renderer from "../../src/renderer/Renderer.js";
import ViewFinder from "../../src/runtime/ViewFinder.js";

describe("Dependency Tracking & ViewCache Invalidation", () => {
    let tmpDir;
    let manager;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ecf-dep-test-"));
        fs.mkdirSync(path.join(tmpDir, "partials"), { recursive: true });

        fs.writeFileSync(path.join(tmpDir, "partials", "header.ecf"), "<h1>Header Version 1</h1>");
        fs.writeFileSync(path.join(tmpDir, "page.ecf"), `@include("partials.header")\n<p>Content</p>`);

        const loader = new ViewLoader();
        const compiler = new Compiler();
        const renderer = new Renderer();
        const finder = new ViewFinder([tmpDir], ".ecf");

        manager = new ViewManager(loader, compiler, renderer, { finder, cache: true });
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test("compilation captures child view dependencies", async () => {
        const compilation = await manager.inspect("page");
        assert.deepEqual(compilation.dependencies, ["partials.header"]);
    });

    test("updating an included child view invalidates cached parent view", async () => {
        const html1 = await manager.render("page");
        assert.ok(html1.includes("Header Version 1"));

        // Wait slightly to guarantee mtime timestamp difference
        await new Promise(r => setTimeout(r, 50));

        // Update included child view
        fs.writeFileSync(path.join(tmpDir, "partials", "header.ecf"), "<h1>Header Version 2</h1>");

        // Rendering should automatically detect child view modification and recompile
        const html2 = await manager.render("page");
        assert.ok(html2.includes("Header Version 2"));
    });
});
