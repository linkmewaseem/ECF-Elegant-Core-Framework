import ViewError from "../errors/ViewError.js";

export default class DirectiveRegistry {
    constructor() {
        this.directives = new Map();
    }

    register(name, handler) {
        if (typeof name !== "string" || !name.trim()) {
            throw new ViewError("Directive name must be a non-empty string.");
        }
        if (typeof handler !== "function") {
            throw new ViewError("Directive handler must be a function.");
        }
        
        const cleanName = name.trim().replace(/^@/, "");
        this.directives.set(cleanName, handler);
        return this;
    }

    has(name) {
        if (typeof name !== "string") return false;
        const cleanName = name.trim().replace(/^@/, "");
        return this.directives.has(cleanName);
    }

    get(name) {
        if (typeof name !== "string") return undefined;
        const cleanName = name.trim().replace(/^@/, "");
        return this.directives.get(cleanName);
    }

    execute(name, args, data, context) {
        const handler = this.get(name);
        if (!handler) {
            throw new ViewError(`Unknown custom directive: @${name}`);
        }
        return handler(args, data, context);
    }

    clear() {
        this.directives.clear();
        return this;
    }
}
