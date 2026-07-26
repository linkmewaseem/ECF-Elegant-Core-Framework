export default class MemberExpressionNode {
    constructor(object, property, computed = false, optional = false) {
        this.type = "MemberExpression";
        this.object = object;
        this.property = property;
        this.computed = computed;
        this.optional = optional;
    }
}
