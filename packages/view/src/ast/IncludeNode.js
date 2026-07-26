import ViewError from "../errors/ViewError.js";

export default class IncludeNode {
    constructor(viewExpr, dataExpr = null, mode = "always", conditionExpr = null) {
        if (typeof viewExpr !== "string" || viewExpr.trim() === "") {
            throw new ViewError("IncludeNode requires a non-empty view expression string.");
        }

        this.type = "IncludeNode";
        this.viewExpr = viewExpr.trim();
        this.dataExpr = dataExpr ? dataExpr.trim() : null;
        this.mode = mode; // "always" | "if" | "when" | "unless" | "first"
        this.conditionExpr = conditionExpr ? conditionExpr.trim() : null;
    }
}
