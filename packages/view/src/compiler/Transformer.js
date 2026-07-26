import ExpressionEngine from "../expression/ExpressionEngine.js";

export default class Transformer {
    constructor(expressionEngine = new ExpressionEngine()) {
        this.engine = expressionEngine;
    }

    transform(ast) {
        if (!ast) return ast;
        const dependencies = new Set();
        this.transformNode(ast, dependencies);
        ast.dependencies = Array.from(dependencies);
        return ast;
    }

    transformNode(node, dependencies) {
        if (!node || typeof node !== "object") return;

        switch (node.type) {
            case "Root":
            case "RootNode":
                if (Array.isArray(node.children)) {
                    node.children.forEach(child => this.transformNode(child, dependencies));
                }
                break;

            case "ExpressionNode":
                if (node.expression) {
                    node.expressionAst = this.engine.parse(node.expression);
                }
                break;

            case "ExtendsNode":
                if (node.layoutExpr) {
                    node.layoutExprAst = this.engine.parse(node.layoutExpr);
                    if (node.layoutExprAst.type === "Literal" && typeof node.layoutExprAst.value === "string") {
                        dependencies.add(node.layoutExprAst.value);
                    }
                }
                break;

            case "SectionNode":
                if (node.nameExpr) {
                    node.nameExprAst = this.engine.parse(node.nameExpr);
                }
                if (node.inlineExpr) {
                    node.inlineExprAst = this.engine.parse(node.inlineExpr);
                }
                if (Array.isArray(node.body)) {
                    node.body.forEach(child => this.transformNode(child, dependencies));
                }
                break;

            case "YieldNode":
                if (node.nameExpr) {
                    node.nameExprAst = this.engine.parse(node.nameExpr);
                }
                if (node.defaultExpr) {
                    node.defaultExprAst = this.engine.parse(node.defaultExpr);
                }
                break;

            case "IncludeNode":
                if (node.viewExpr) {
                    node.viewExprAst = this.engine.parse(node.viewExpr);
                    if (node.viewExprAst.type === "Literal" && typeof node.viewExprAst.value === "string") {
                        dependencies.add(node.viewExprAst.value);
                    }
                }
                if (node.dataExpr) {
                    node.dataExprAst = this.engine.parse(node.dataExpr);
                }
                if (node.conditionExpr) {
                    node.conditionExprAst = this.engine.parse(node.conditionExpr);
                }
                break;

            case "IfNode":
                if (node.condition) {
                    node.conditionAst = this.engine.parse(node.condition);
                }
                if (Array.isArray(node.consequent)) {
                    node.consequent.forEach(child => this.transformNode(child, dependencies));
                }
                if (Array.isArray(node.alternate)) {
                    node.alternate.forEach(child => this.transformNode(child, dependencies));
                }
                if (Array.isArray(node.elseIfs)) {
                    node.elseIfs.forEach(elseIf => {
                        if (elseIf.condition) {
                            elseIf.conditionAst = this.engine.parse(elseIf.condition);
                        }
                        if (Array.isArray(elseIf.body)) {
                            elseIf.body.forEach(child => this.transformNode(child, dependencies));
                        }
                    });
                }
                break;

            case "ForNode":
                if (node.iterable) {
                    node.iterableAst = this.engine.parse(node.iterable);
                }
                if (Array.isArray(node.body)) {
                    node.body.forEach(child => this.transformNode(child, dependencies));
                }
                break;

            case "SwitchNode":
                if (node.expression) {
                    node.expressionAst = this.engine.parse(node.expression);
                }
                if (Array.isArray(node.cases)) {
                    node.cases.forEach(caseNode => this.transformNode(caseNode, dependencies));
                }
                if (Array.isArray(node.defaultBody)) {
                    node.defaultBody.forEach(child => this.transformNode(child, dependencies));
                }
                break;

            case "CaseNode":
                if (Array.isArray(node.body)) {
                    node.body.forEach(child => this.transformNode(child, dependencies));
                }
                break;

            case "BreakNode":
            case "ContinueNode":
                if (node.condition) {
                    node.conditionAst = this.engine.parse(node.condition);
                }
                break;

            default:
                break;
        }
    }
}
