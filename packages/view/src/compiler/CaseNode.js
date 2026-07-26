import ViewError from "../errors/ViewError.js";

export default class CaseNode {
    constructor(value, body = []) {
        if (!Array.isArray(body)) {
            throw new ViewError("CaseNode requires an array for body.");
        }

        this.type = "CaseNode";
        this.value = value; // parsed literal: string | number | boolean | null
        this.body = body;
    }
}
