export default class ExtendsNode {
    constructor(layoutExpr) {
        this.type = "ExtendsNode";
        this.layoutExpr = layoutExpr;
        this.layoutExprAst = null;
    }
}
