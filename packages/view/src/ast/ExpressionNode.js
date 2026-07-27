import ViewError from "../errors/ViewError.js";

export default class ExpressionNode {
    constructor(expression, escapeMode = "escape") {
        if (typeof expression !== "string" || expression.trim() === "") {
            throw new ViewError("ExpressionNode requires a non-empty expression string.");
        }

        this.type = "ExpressionNode";
        this.expression = expression.trim();
        this.escapeMode = escapeMode; // "escape", "raw", or "triple"
    }
}
