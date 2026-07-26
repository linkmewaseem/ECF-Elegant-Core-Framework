import { describe, test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import ViewManager from "../../src/manager/ViewManager.js";
import Compiler from "../../src/Compiler.js";
import generateId from "../../src/utils/generateId.js";

const BASE_PATH = path.resolve("/views");

function makeFakeLoader(files = {}) {
    return {
        async load(filePath) {
            if (!files[filePath]) {
                throw new Error(`File not found: ${filePath}`);
            }
            return {
                id: generateId(filePath),
                path: filePath,
                source: files[filePath].source,
                extension: files[filePath].extension ?? ".ecf",
                lastModified: files[filePath].lastModified ?? 100
            };
        },
        async exists(filePath) {
            return Boolean(files[filePath]);
        }
    };
}

function makeFakeRenderer() {
    return {
        render(compiledTemplate, data) {
            return compiledTemplate.render(data);
        }
    };
}

describe("ViewManager - precompile()", () => {
    test("should compile and cache without needing a render call first", async () => {
        const filePath = path.join(BASE_PATH, "home.ecf");
        const loader = makeFakeLoader({ [filePath]: { source: "<h1>Home</h1>", extension: ".ecf", lastModified: 1 } });
        const manager = new ViewManager(loader, new Compiler(), makeFakeRenderer(), { basePath: BASE_PATH });

        const compiled = await manager.precompile("home");
        assert.equal(typeof compiled.hash, "string");

        const rendered = await manager.render("home", {});
        assert.equal(rendered, "<h1>Home</h1>"); // came from cache, not recompiled
    });
});

describe("ViewManager - inspect()", () => {
    test("should return tokens, ast, hash, compiledSize, compileTime, renderTime", async () => {
        const filePath = path.join(BASE_PATH, "home.ecf");
        const loader = makeFakeLoader({ [filePath]: { source: "<h1>Home</h1>", extension: ".ecf", lastModified: 1 } });
        const manager = new ViewManager(loader, new Compiler(), makeFakeRenderer(), { basePath: BASE_PATH });

        const result = await manager.inspect("home");
        assert.equal(result.tokens.length, 1);
        assert.equal(result.ast.type, "Root");
        assert.equal(typeof result.hash, "string");
        assert.equal(result.compiledSize, Buffer.byteLength("<h1>Home</h1>", "utf-8"));
        assert.equal(typeof result.compileTime, "number");
        assert.equal(typeof result.renderTime, "number");
    });
});
