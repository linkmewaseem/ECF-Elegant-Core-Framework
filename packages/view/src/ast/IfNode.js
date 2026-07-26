import ViewError from "../errors/ViewError.js";

export default class IfNode {
    constructor(condition, consequent, alternate = null, elseIfs = []) {
        if (typeof condition !== "string" || condition.trim() === "") {
            throw new ViewError("IfNode requires a non-empty condition string.");
        }
        if (!Array.isArray(consequent)) {
            throw new ViewError("IfNode requires an array for consequent.");
        }
        if (alternate !== null && !Array.isArray(alternate)) {
            throw new ViewError("IfNode requires an array or null for alternate.");
        }
        if (!Array.isArray(elseIfs)) {
            throw new ViewError("IfNode requires an array for elseIfs.");
        }

        this.type = "IfNode";
        this.condition = condition.trim();
        this.consequent = consequent;   // array of AST nodes — the "true" branch
        this.alternate = alternate;     // null or array of AST nodes (@else branch)
        this.elseIfs = elseIfs;         // array of { condition, body } objects (@elseif branches)
    }
}
