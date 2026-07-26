export default class ObjectExpressionNode {
    constructor(properties) {
        this.type = "ObjectExpression";
        this.properties = properties; // array of { key: string, value: ASTNode }
    }
}
