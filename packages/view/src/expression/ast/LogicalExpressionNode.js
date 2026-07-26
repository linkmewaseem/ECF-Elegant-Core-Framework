export default class LogicalExpressionNode {
    constructor(operator, left, right) {
        this.type = "LogicalExpression";
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}
