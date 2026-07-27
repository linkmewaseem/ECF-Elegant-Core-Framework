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
import ViewError from "../../src/errors/ViewError.js";
import AttributeBag from "../../src/runtime/AttributeBag.js";

describe("Component System & Slots (<x-...>)", () => {
    let tmpDir;
    let manager;

    function createTestManager(files = {}) {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecf-comp-test-"));
        for (const [relPath, content] of Object.entries(files)) {
            const fullPath = path.join(dir, relPath);
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, content);
        }

        const loader = new ViewLoader();
        const compiler = new Compiler();
        const renderer = new Renderer();
        const finder = new ViewFinder([dir], ".ecf");

        return {
            manager: new ViewManager(loader, compiler, renderer, { finder }),
            dir
        };
    }

    test("AttributeBag string representation and merging", () => {
        const bag = AttributeBag.create({ class: "btn-primary", id: "save-btn", disabled: true, title: null });
        assert.equal(bag.toString(), 'class="btn-primary" id="save-btn" disabled');

        const merged = bag.merge({ class: "base-btn", type: "button" });
        assert.equal(merged.toString(), 'class="base-btn btn-primary" type="button" id="save-btn" disabled');
    });

    test("Self-closing component rendering (<x-button />)", async () => {
        const { manager, dir } = createTestManager({
            "components/button.ecf": `<button class="btn">{{ label }}</button>`,
            "page.ecf": `<x-button label="Click Me" />`
        });

        try {
            const html = await manager.render("page", {});
            assert.equal(html.trim(), `<button class="btn">Click Me</button>`);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    test("Component with dynamic props and default slot", async () => {
        const { manager, dir } = createTestManager({
            "components/card.ecf": `
<div class="card">
    <h3>{{ title }}</h3>
    <div class="card-body">
        {{ $slot }}
    </div>
</div>`,
            "page.ecf": `
<x-card :title="pageTitle">
    <p>User: {{ user.name }}</p>
</x-card>`
        });

        try {
            const html = await manager.render("page", {
                pageTitle: "Dashboard Overview",
                user: { name: "John Doe" }
            });
            assert.ok(html.includes("<h3>Dashboard Overview</h3>"));
            assert.ok(html.includes("<p>User: John Doe</p>"));
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    test("Component with named slots (<x-slot:header>, <x-slot:footer>)", async () => {
        const { manager, dir } = createTestManager({
            "components/modal.ecf": `
<div class="modal">
    <div class="modal-header">{{ $header }}</div>
    <div class="modal-body">{{ $slot }}</div>
    <div class="modal-footer">{{ $footer }}</div>
</div>`,
            "page.ecf": `
<x-modal>
    <x-slot:header>
        <h2>Modal Title</h2>
    </x-slot:header>

    <p>Modal body content.</p>

    <x-slot:footer>
        <button>Close</button>
    </x-slot:footer>
</x-modal>`
        });

        try {
            const html = await manager.render("page", {});
            assert.ok(html.includes('<h2>Modal Title</h2>'));
            assert.ok(html.includes('<p>Modal body content.</p>'));
            assert.ok(html.includes('<button>Close</button>'));
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    test("AttributeBag $attributes forwarding inside component", async () => {
        const { manager, dir } = createTestManager({
            "components/alert.ecf": `
<div {{ $attributes.merge({ class: "alert alert-default" }) }}>
    {{ $slot }}
</div>`,
            "page.ecf": `
<x-alert class="alert-danger" id="sec-alert" role="alert">
    Something went wrong!
</x-alert>`
        });

        try {
            const html = await manager.render("page", {});
            assert.ok(html.includes('class="alert alert-default alert-danger"'));
            assert.ok(html.includes('id="sec-alert"'));
            assert.ok(html.includes('role="alert"'));
            assert.ok(html.includes("Something went wrong!"));
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    test("Nested components rendering", async () => {
        const { manager, dir } = createTestManager({
            "components/card.ecf": `<div class="card">{{ $slot }}</div>`,
            "components/badge.ecf": `<span class="badge {{ type }}">{{ $slot }}</span>`,
            "page.ecf": `<x-card><x-badge type="success">Active</x-badge></x-card>`
        });

        try {
            const html = await manager.render("page", {});
            assert.equal(html.trim(), `<div class="card"><span class="badge success">Active</span></div>`);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    test("Component dependency tracking and cache invalidation", async () => {
        const { manager, dir } = createTestManager({
            "components/item.ecf": `<li>{{ name }}</li>`,
            "page.ecf": `<ul><x-item name="Alpha" /></ul>`
        });

        try {
            const firstRender = await manager.render("page", {});
            assert.equal(firstRender.trim(), `<ul><li>Alpha</li></ul>`);

            // Sleep slightly for mtime resolution & rewrite component
            await new Promise(res => setTimeout(res, 10));
            fs.writeFileSync(path.join(dir, "components", "item.ecf"), `<li class="updated">{{ name }}</li>`);

            const secondRender = await manager.render("page", {});
            assert.equal(secondRender.trim(), `<ul><li class="updated">Alpha</li></ul>`);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    test("Unclosed component tag throws ViewError", async () => {
        const { manager, dir } = createTestManager({
            "components/card.ecf": `<div></div>`,
            "page.ecf": `<x-card>Unclosed content`
        });

        try {
            await assert.rejects(
                async () => await manager.render("page", {}),
                (err) => err instanceof ViewError && err.message.includes("unclosed component <x-card>")
            );
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    test("Mismatched component tag throws ViewError", async () => {
        const { manager, dir } = createTestManager({
            "components/card.ecf": `<div></div>`,
            "page.ecf": `<x-card>Content</x-modal>`
        });

        try {
            await assert.rejects(
                async () => await manager.render("page", {}),
                (err) => err instanceof ViewError && err.message.includes("mismatched component tag")
            );
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
});
