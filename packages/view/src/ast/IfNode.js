import ViewError from "../errors/ViewError.js";

export default class IfNode {
    constructor(condition, consequent, alternate = null) {
        if (typeof condition !== "string" || condition.trim() === "") {
            throw new ViewError("IfNode requires a non-empty condition string.");
        }
        if (!Array.isArray(consequent)) {
            throw new ViewError("IfNode requires an array for consequent.");
        }

        this.type = "IfNode";
        this.condition = condition.trim();
        this.consequent = consequent;   // array of AST nodes — the "true" branch
        this.alternate = alternate;     // null for now (no @else yet)
    }
}
