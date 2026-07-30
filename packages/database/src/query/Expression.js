export default class Expression {
    #value;

    constructor(value) {
        this.#value = String(value ?? "");
    }

    getValue() {
        return this.#value;
    }

    toString() {
        return this.#value;
    }

    static isExpression(value) {
        return value instanceof Expression;
    }
}

export function isExpression(value) {
    return Expression.isExpression(value);
}
