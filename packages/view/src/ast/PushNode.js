import ViewError from "../errors/ViewError.js";

export default class PushNode {
    constructor(name, mode = "push", children = []) {
        if (typeof name !== "string" || !name.trim()) {
            throw new ViewError("PushNode requires a non-empty stack name.");
        }
        this.type = "Push";
        this.name = name.trim();
        this.mode = mode; // "push" or "prepend"
        this.children = Array.isArray(children) ? children : [];
    }
}
