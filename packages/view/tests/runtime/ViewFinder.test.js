import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import ViewFinder from "../../src/runtime/ViewFinder.js";

describe("ViewFinder", () => {
    let tmpDir;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ecf-finder-test-"));
        fs.mkdirSync(path.join(tmpDir, "partials"), { recursive: true });
        fs.writeFileSync(path.join(tmpDir, "partials", "header.ecf"), "<h1>Header</h1>");
        fs.writeFileSync(path.join(tmpDir, "home.ecf"), "<h1>Home</h1>");
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test("resolves dot notation view names to file paths", () => {
        const finder = new ViewFinder([tmpDir], ".ecf");
        const resolved = finder.find("partials.header");
        assert.equal(resolved, path.join(tmpDir, "partials", "header.ecf"));
    });

    test("resolves views in root path", () => {
        const finder = new ViewFinder([tmpDir]);
        const resolved = finder.find("home");
        assert.equal(resolved, path.join(tmpDir, "home.ecf"));
    });

    test("supports registered namespaces", () => {
        const adminDir = fs.mkdtempSync(path.join(os.tmpdir(), "ecf-admin-test-"));
        fs.writeFileSync(path.join(adminDir, "nav.ecf"), "<nav>Admin</nav>");

        const finder = new ViewFinder([tmpDir]);
        finder.addNamespace("admin", adminDir);

        const resolved = finder.find("admin::nav");
        assert.equal(resolved, path.join(adminDir, "nav.ecf"));

        fs.rmSync(adminDir, { recursive: true, force: true });
    });

    test("findFirst returns first existing view path", () => {
        const finder = new ViewFinder([tmpDir]);
        const resolved = finder.findFirst(["missing.view", "partials.header", "home"]);
        assert.equal(resolved, path.join(tmpDir, "partials", "header.ecf"));
    });
});
