export default class ConditionalExpressionNode {
    constructor(test, consequent, alternate) {
        this.type = "ConditionalExpression";
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
}
