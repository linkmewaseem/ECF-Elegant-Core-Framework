import ViewError from "../errors/ViewError.js";

export default class ForNode {
    constructor(iterable, itemName, indexName = null, keyName = null, body = []) {
        if (typeof iterable !== "string" || iterable.trim() === "") {
            throw new ViewError("ForNode requires a non-empty iterable expression.");
        }
        if (typeof itemName !== "string" || itemName.trim() === "") {
            throw new ViewError("ForNode requires a non-empty itemName.");
        }
        if (!Array.isArray(body)) {
            throw new ViewError("ForNode requires an array for body.");
        }

        this.type = "ForNode";
        this.iterable = iterable.trim();
        this.itemName = itemName;
        this.indexName = indexName;
        this.keyName = keyName;  // reserved — future @for(map as key, value)
        this.body = body;
    }
}
