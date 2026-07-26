import { ViewContract } from "@ecf/core";
import path from "node:path";
import fsSync from "node:fs";
import ViewCache from "../cache/ViewCache.js";
import ViewFinder from "../runtime/ViewFinder.js";
import RenderContext from "../runtime/RenderContext.js";
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

        this.finder = options.finder ?? new ViewFinder([this.basePath], this.extension);
    }

    async render(name, data = {}, context = null) {
        const renderContext = context ? context.pushView(name) : new RenderContext().pushView(name);
        const compiledTemplate = await this.compile(name);
        const renderData = { ...data, __viewManager: this };
        return this.renderer.render(compiledTemplate, renderData, renderContext);
    }

    renderSync(name, data = {}, context = null) {
        const renderContext = context ? context.pushView(name) : new RenderContext().pushView(name);
        const compiledTemplate = this.compileSync(name);
        const renderData = { ...data, __viewManager: this };
        return this.renderer.render(compiledTemplate, renderData, renderContext);
    }

    async resolve(name) {
        this.validateName(name);
        const filePath = this.resolvePath(name);
        const { id, path: resolvedPath, source, extension, lastModified } = await this.loader.load(filePath);
        return { id, name, path: resolvedPath, source, extension, lastModified };
    }

    resolveSync(name) {
        this.validateName(name);
        const filePath = this.resolvePath(name);
        const { id, path: resolvedPath, source, extension, lastModified } = this.loader.loadSync(filePath);
        return { id, name, path: resolvedPath, source, extension, lastModified };
    }

    async precompile(name) {
        return this.compile(name);
    }

    async compile(name) {
        const templateFile = await this.resolve(name);

        if (this.cacheEnabled && this.cache.has(templateFile.id)) {
            const cached = this.cache.get(templateFile.id);
            if (!this.isStale(templateFile, cached)) {
                return cached;
            }
            this.cache.forget(templateFile.id);
        }

        const compiledTemplate = this.compiler.compile(templateFile);

        if (this.cacheEnabled) {
            this.cache.set(templateFile.id, compiledTemplate);
        }

        return compiledTemplate;
    }

    compileSync(name) {
        const templateFile = this.resolveSync(name);

        if (this.cacheEnabled && this.cache.has(templateFile.id)) {
            const cached = this.cache.get(templateFile.id);
            if (!this.isStale(templateFile, cached)) {
                return cached;
            }
            this.cache.forget(templateFile.id);
        }

        const compiledTemplate = this.compiler.compile(templateFile);

        if (this.cacheEnabled) {
            this.cache.set(templateFile.id, compiledTemplate);
        }

        return compiledTemplate;
    }

    isStale(templateFile, cachedTemplate) {
        if (!cachedTemplate.compiledAt) return true;

        if (templateFile.lastModified > cachedTemplate.compiledAt) {
            return true;
        }

        for (const depName of cachedTemplate.dependencies ?? []) {
            try {
                if (this.finder.exists(depName)) {
                    const depPath = this.finder.find(depName);
                    const stats = fsSync.statSync(depPath);
                    if (stats.mtimeMs > cachedTemplate.compiledAt) {
                        return true;
                    }
                }
            } catch {
                return true;
            }
        }

        return false;
    }

    async inspect(name) {
        const templateFile = await this.resolve(name);
        const wasCached = this.cacheEnabled && this.cache.has(templateFile.id);

        const compileStartedAt = performance.now();
        const compilation = this.compiler.analyze(templateFile);
        const compileTime = performance.now() - compileStartedAt;

        const renderStartedAt = performance.now();
        const renderContext = new RenderContext().pushView(name);
        const html = compilation.render({ __viewManager: this }, renderContext);
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
        if (this.finder.exists(name)) {
            return this.finder.find(name);
        }
        const relativePath = name.split(".").join(path.sep) + this.extension;
        return path.join(this.basePath, relativePath);
    }

    async exists(name) {
        if (this.finder.exists(name)) return true;
        const filePath = this.resolvePath(name);
        return this.loader.exists(filePath);
    }

    existsSync(name) {
        if (this.finder.exists(name)) return true;
        const filePath = this.resolvePath(name);
        return this.loader.existsSync ? this.loader.existsSync(filePath) : false;
    }

    clearCache() {
        this.cache.clear();
        return this;
    }

    forget(name) {
        const filePath = this.resolvePath(name);
        const id = generateId(filePath);
        return this.cache.forget(id);
    }

    validateLoader(loader) {
        if (!loader || typeof loader.load !== "function") {
            throw new ViewError("ViewManager requires a valid ViewLoader instance.");
        }
    }

    validateCompiler(compiler) {
        if (!compiler || typeof compiler.compile !== "function") {
            throw new ViewError("ViewManager requires a valid Compiler instance.");
        }
    }

    validateRenderer(renderer) {
        if (!renderer || typeof renderer.render !== "function") {
            throw new ViewError("ViewManager requires a valid Renderer instance.");
        }
    }

    validateName(name) {
        if (typeof name !== "string" || name.trim() === "") {
            throw new ViewError("ViewManager requires a non-empty view name string.");
        }
    }
}
