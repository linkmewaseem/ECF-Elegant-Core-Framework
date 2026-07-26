import ViewError from "../errors/ViewError.js";

export default class ContinueNode {
    constructor(condition = null) {
        if (condition !== null && (typeof condition !== "string" || condition.trim() === "")) {
            throw new ViewError("ContinueNode condition must be a non-empty string or null.");
        }
        this.type = "ContinueNode";
        this.condition = condition;
    }
}
