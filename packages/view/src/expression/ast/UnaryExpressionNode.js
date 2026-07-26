export default class UnaryExpressionNode {
    constructor(operator, argument) {
        this.type = "UnaryExpression";
        this.operator = operator;
        this.argument = argument;
    }
}
