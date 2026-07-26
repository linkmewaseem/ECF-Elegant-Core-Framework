import CompiledTemplate from "./CompiledTemplate.js";

export default class Compilation {
    constructor({ name, tokens, ast, render, assets, dependencies, hash }) {
        this.name = name;
        this.tokens = tokens;
        this.ast = ast;
        this.render = render;
        this.assets = assets;
        this.dependencies = dependencies;
        this.hash = hash;
    }

    finalize() {
        return new CompiledTemplate({
            name: this.name,
            ast: this.ast,
            render: this.render,
            assets: this.assets,
            dependencies: this.dependencies,
            hash: this.hash,
            compiledAt: Date.now()
        });
    }
}
