export default class SectionNode {
    constructor(nameExpr, inlineExpr = null, body = null, isShown = false) {
        this.type = "SectionNode";
        this.nameExpr = nameExpr;
        this.nameExprAst = null;
        this.inlineExpr = inlineExpr;
        this.inlineExprAst = null;
        this.body = body;
        this.isShown = isShown;
    }
}
