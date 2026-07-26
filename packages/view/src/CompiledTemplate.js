import ViewError from "./errors/ViewError.js";

export default class CompiledTemplate {
    constructor({ name, ast, render, assets, dependencies, hash, compiledAt }) {
        if (typeof render !== "function") {
            throw new ViewError("CompiledTemplate requires a render() function.");
        }

        this.name = name;
        this.ast = ast;
        this.render = render;
        this.assets = assets ?? { css: [], js: [], fonts: [], images: [] };
        this.dependencies = dependencies ?? [];
        this.hash = hash;
        this.compiledAt = compiledAt ?? Date.now(); // timestamp (number), never a Date object

        Object.freeze(this);
    }

    invalidate() {
        throw new ViewError("CompiledTemplate.invalidate() is not implemented.");
    }

    toJSON() {
        return {
            name: this.name,
            hash: this.hash,
            dependencies: this.dependencies,
            assets: this.assets,
            compiledAt: this.compiledAt
        };
    }

    serialize() {
        return JSON.stringify(this.toJSON());
    }

    inspect() {
        return this.toJSON();
    }
}
