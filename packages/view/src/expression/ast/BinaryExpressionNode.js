export default class BinaryExpressionNode {
    constructor(operator, left, right) {
        this.type = "BinaryExpression";
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}
