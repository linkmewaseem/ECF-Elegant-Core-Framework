import ViewError from "../errors/ViewError.js";

export const MAX_INCLUDE_DEPTH = 100;

export default class RenderContext {
    constructor(options = {}) {
        this.depth = options.depth ?? 0;
        this.viewChain = options.viewChain ? [...options.viewChain] : [];
        this.sections = options.sections ?? new Map();
        this.stacks = options.stacks ?? new Map();
        this.onceKeys = options.onceKeys ?? new Set();
        this.extendedLayout = null;
    }

    pushView(viewName) {
        if (this.depth >= MAX_INCLUDE_DEPTH) {
            throw new ViewError(`Maximum include depth exceeded (${MAX_INCLUDE_DEPTH}).`);
        }

        if (this.viewChain.includes(viewName)) {
            const chain = [...this.viewChain, viewName].join(" -> ");
            throw new ViewError(`Circular include detected: ${chain}`);
        }

        return new RenderContext({
            depth: this.depth + 1,
            viewChain: [...this.viewChain, viewName],
            sections: this.sections,
            stacks: this.stacks,
            onceKeys: this.onceKeys
        });
    }

    pushStack(name, content, mode = "push") {
        if (typeof name !== "string" || !name.trim()) {
            throw new ViewError("Stack name must be a non-empty string.");
        }
        const stackName = name.trim();
        if (!this.stacks.has(stackName)) {
            this.stacks.set(stackName, []);
        }
        const stackList = this.stacks.get(stackName);
        if (mode === "prepend") {
            stackList.unshift(content);
        } else {
            stackList.push(content);
        }
    }

    renderStack(name) {
        if (typeof name !== "string" || !name.trim()) {
            return "";
        }
        const stackName = name.trim();
        if (!this.stacks.has(stackName)) {
            return "";
        }
        return this.stacks.get(stackName).join("");
    }

    hasOnce(key) {
        return this.onceKeys.has(key);
    }

    markOnce(key) {
        this.onceKeys.add(key);
    }

    addSection(name, sectionContent) {
        if (!this.sections.has(name)) {
            this.sections.set(name, []);
        }
        this.sections.get(name).push(sectionContent);
    }

    hasSection(name) {
        return this.sections.has(name) && this.sections.get(name).length > 0;
    }

    renderSection(name, defaultContent = "", data = {}, renderer = null) {
        if (!this.hasSection(name)) {
            return defaultContent;
        }

        const definitions = this.sections.get(name);
        return this.evaluateSectionChain(definitions, 0, defaultContent, data, renderer);
    }

    evaluateSectionChain(definitions, index, defaultContent, data, renderer) {
        if (index >= definitions.length) {
            return defaultContent;
        }

        const currentDef = definitions[index];

        if (typeof currentDef === "string") {
            return currentDef;
        }

        if (typeof currentDef === "function") {
            const parentEvaluator = () => this.evaluateSectionChain(definitions, index + 1, defaultContent, data, renderer);
            return currentDef(data, parentEvaluator, renderer);
        }

        return "";
    }
}
