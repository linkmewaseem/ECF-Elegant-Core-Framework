import ViewError from "../errors/ViewError.js";

export const MAX_INCLUDE_DEPTH = 100;

export default class RenderContext {
    constructor(options = {}) {
        this.depth = options.depth ?? 0;
        this.renderStack = options.renderStack ? [...options.renderStack] : [];
        this.sections = options.sections ?? new Map();
        this.extendedLayout = null;
    }

    pushView(viewName) {
        if (this.depth >= MAX_INCLUDE_DEPTH) {
            throw new ViewError(`Maximum include depth exceeded (${MAX_INCLUDE_DEPTH}).`);
        }

        if (this.renderStack.includes(viewName)) {
            const chain = [...this.renderStack, viewName].join(" -> ");
            throw new ViewError(`Circular include detected: ${chain}`);
        }

        return new RenderContext({
            depth: this.depth + 1,
            renderStack: [...this.renderStack, viewName],
            sections: this.sections
        });
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
