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

describe("@include Directives", () => {
    let tmpDir;
    let manager;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ecf-include-test-"));
        fs.mkdirSync(path.join(tmpDir, "partials"), { recursive: true });

        fs.writeFileSync(path.join(tmpDir, "partials", "header.ecf"), "<h1>Header: {{ title }}</h1>");
        fs.writeFileSync(path.join(tmpDir, "partials", "footer.ecf"), "<footer>Footer</footer>");
        fs.writeFileSync(path.join(tmpDir, "partials", "banner.ecf"), "<div>Banner: {{ message }}</div>");

        const loader = new ViewLoader();
        const compiler = new Compiler();
        const renderer = new Renderer();
        const finder = new ViewFinder([tmpDir], ".ecf");

        manager = new ViewManager(loader, compiler, renderer, { finder });
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test("@include renders partial view with inherited and extra scope data", async () => {
        fs.writeFileSync(
            path.join(tmpDir, "page.ecf"),
            `@include("partials.header", { title: "Welcome Home" })\n<main>Body</main>\n@include("partials.footer")`
        );

        const html = await manager.render("page", { siteName: "MySite" });
        assert.ok(html.includes("<h1>Header: Welcome Home</h1>"));
        assert.ok(html.includes("<main>Body</main>"));
        assert.ok(html.includes("<footer>Footer</footer>"));
    });

    test("@includeIf renders view if exists and skips if missing", async () => {
        fs.writeFileSync(
            path.join(tmpDir, "page_if.ecf"),
            `@includeIf("partials.header", { title: "Header Exists" })\n@includeIf("partials.missing_widget")`
        );

        const html = await manager.render("page_if");
        assert.ok(html.includes("<h1>Header: Header Exists</h1>"));
        assert.ok(!html.includes("missing_widget"));
    });

    test("@includeWhen and @includeUnless evaluate conditions", async () => {
        fs.writeFileSync(
            path.join(tmpDir, "page_cond.ecf"),
            `@includeWhen(showBanner, "partials.banner", { message: "Promo!" })\n@includeUnless(hideFooter, "partials.footer")`
        );

        const html1 = await manager.render("page_cond", { showBanner: true, hideFooter: false });
        assert.ok(html1.includes("Banner: Promo!"));
        assert.ok(html1.includes("<footer>Footer</footer>"));

        const html2 = await manager.render("page_cond", { showBanner: false, hideFooter: true });
        assert.ok(!html2.includes("Banner: Promo!"));
        assert.ok(!html2.includes("<footer>Footer</footer>"));
    });

    test("@includeFirst renders the first existing partial view", async () => {
        fs.writeFileSync(
            path.join(tmpDir, "page_first.ecf"),
            `@includeFirst(["custom.header", "partials.header"], { title: "First Header" })`
        );

        const html = await manager.render("page_first");
        assert.ok(html.includes("<h1>Header: First Header</h1>"));
    });
});
