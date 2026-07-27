import ViewError from "../errors/ViewError.js";

export default class CustomDirectiveNode {
    constructor(name, expression = null) {
        if (typeof name !== "string" || !name.trim()) {
            throw new ViewError("CustomDirectiveNode requires a valid directive name.");
        }
        this.type = "CustomDirective";
        this.name = name.trim().replace(/^@/, "");
        this.expression = expression;
    }
}
