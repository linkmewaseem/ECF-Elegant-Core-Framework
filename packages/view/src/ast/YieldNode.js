export default class YieldNode {
    constructor(nameExpr, defaultExpr = null) {
        this.type = "YieldNode";
        this.nameExpr = nameExpr;
        this.nameExprAst = null;
        this.defaultExpr = defaultExpr;
        this.defaultExprAst = null;
    }
}
