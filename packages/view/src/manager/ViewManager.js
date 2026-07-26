import { ViewContract } from "@ecf/core";
import path from "node:path";
import ViewCache from "../cache/ViewCache.js";
import generateId from "../utils/generateId.js";
import ViewError from "../errors/ViewError.js";

export default class ViewManager extends ViewContract {
    constructor(loader, compiler, renderer, options = {}) {
        super();
        this.validateLoader(loader);
        this.validateCompiler(compiler);
        this.validateRenderer(renderer);

        this.loader = loader;
        this.compiler = compiler;
        this.renderer = renderer;
        this.basePath = options.basePath ?? process.cwd();
        this.extension = options.extension ?? ".ecf";
        this.cacheEnabled = options.cache ?? true;
        this.cache = new ViewCache();
    }

    async render(name, data = {}) {
        const compiledTemplate = await this.compile(name);
        return this.renderer.render(compiledTemplate, data);
    }

    async resolve(name) {
        this.validateName(name);
        const filePath = this.resolvePath(name);
        const { id, path: resolvedPath, source, extension, lastModified } = await this.loader.load(filePath);
        return { id, name, path: resolvedPath, source, extension, lastModified };
    }

    // compile-only + cache, no render — for `ecf build`
    async precompile(name) {
        return this.compile(name);
    }

    async compile(name) {
        const templateFile = await this.resolve(name);

        if (this.cacheEnabled && this.cache.has(templateFile.id)) {
            return this.cache.get(templateFile.id);
        }

        const compiledTemplate = this.compiler.compile(templateFile);

        if (this.cacheEnabled) {
            this.cache.set(templateFile.id, compiledTemplate);
        }

        return compiledTemplate;
    }

    // Full diagnostic snapshot for `ecf inspect <name>` — always analyzes fresh
    // (doesn't touch the render cache) so tokens/ast are always available.
    async inspect(name) {
        const templateFile = await this.resolve(name);
        const wasCached = this.cacheEnabled && this.cache.has(templateFile.id);

        const compileStartedAt = performance.now();
        const compilation = this.compiler.analyze(templateFile);
        const compileTime = performance.now() - compileStartedAt;

        const renderStartedAt = performance.now();
        const html = compilation.render({});
        const renderTime = performance.now() - renderStartedAt;

        return {
            path: templateFile.path,
            hash: compilation.hash,
            cache: wasCached,
            dependencies: compilation.dependencies,
            ast: compilation.ast,
            tokens: compilation.tokens,
            assets: compilation.assets,
            compiledSize: Buffer.byteLength(html, "utf-8"),
            compileTime,
            renderTime
        };
    }

    resolvePath(name) {
        this.validateName(name);
        const relativePath = name.split(".").join(path.sep) + this.extension;
        return path.join(this.basePath, relativePath);
    }

    async exists(name) {
        const filePath = this.resolvePath(name);
        return this.loader.exists(filePath);
    }

    clearCache() {
        this.cache.clear();
        return this;
    }

    forget(name) {
        const filePath = this.resolvePath(name);
        this.cache.invalidate(generateId(filePath));
        return this;
    }

    warmup() {
        throw new ViewError("warmup() is not implemented.");
    }

    validateLoader(loader) {
        if (!loader || typeof loader.load !== "function" || typeof loader.exists !== "function") {
            throw new ViewError("ViewManager requires a loader with load() and exists() methods.");
        }
    }

    validateCompiler(compiler) {
        if (!compiler || typeof compiler.compile !== "function" || typeof compiler.analyze !== "function") {
            throw new ViewError("ViewManager requires a compiler with compile() and analyze() methods.");
        }
    }

    validateRenderer(renderer) {
        if (!renderer || typeof renderer.render !== "function") {
            throw new ViewError("ViewManager requires a renderer with a render() method.");
        }
    }

    validateName(name) {
        if (typeof name !== "string" || name.trim() === "") {
            throw new ViewError("View name must be a non-empty string.");
        }
    }
}
