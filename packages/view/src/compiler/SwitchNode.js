import ViewError from "../errors/ViewError.js";

export default class SwitchNode {
    constructor(expression, cases = [], defaultBody = null) {
        if (typeof expression !== "string" || expression.trim() === "") {
            throw new ViewError("SwitchNode requires a non-empty expression string.");
        }
        if (!Array.isArray(cases)) {
            throw new ViewError("SwitchNode requires an array for cases.");
        }
        if (defaultBody !== null && !Array.isArray(defaultBody)) {
            throw new ViewError("SwitchNode defaultBody must be an array or null.");
        }

        this.type = "SwitchNode";
        this.expression = expression.trim();
        this.cases = cases;             // array of CaseNode
        this.defaultBody = defaultBody; // array of AST nodes, or null (no @default)
    }
}
