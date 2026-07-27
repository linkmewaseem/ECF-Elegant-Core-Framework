export default class CallExpressionNode {
    constructor(callee, args = []) {
        this.type = "CallExpression";
        this.callee = callee;
        this.arguments = args;
    }
}
