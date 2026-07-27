import ViewError from "../errors/ViewError.js";

export default class StackNode {
    constructor(name) {
        if (typeof name !== "string" || !name.trim()) {
            throw new ViewError("StackNode requires a non-empty stack name.");
        }
        this.type = "Stack";
        this.name = name.trim();
    }
}
