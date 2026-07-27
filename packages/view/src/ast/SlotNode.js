import ViewError from "../errors/ViewError.js";

export default class SlotNode {
    constructor(name, body = []) {
        if (typeof name !== "string" || name.trim() === "") {
            throw new ViewError("SlotNode requires a non-empty slot name.");
        }

        this.type = "SlotNode";
        this.name = name.trim();
        this.body = body; // Array of AST nodes
    }
}
