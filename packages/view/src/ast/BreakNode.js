import ViewError from "../errors/ViewError.js";

export default class BreakNode {
    constructor(condition = null) {
        if (condition !== null && (typeof condition !== "string" || condition.trim() === "")) {
            throw new ViewError("BreakNode condition must be a non-empty string or null.");
        }
        this.type = "BreakNode";
        this.condition = condition; // null = bare @break, string = @break(condition)
    }
}
