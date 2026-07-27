import ExpressionError from "./errors/ExpressionError.js";

export default class Evaluator {
    evaluate(node, scope = {}) {
        if (!node) return undefined;

        switch (node.type) {
            case "Literal":
                return node.value;

            case "Identifier":
                return this.evaluateIdentifier(node, scope);

            case "MemberExpression":
                return this.evaluateMember(node, scope);

            case "CallExpression":
                return this.evaluateCall(node, scope);

            case "UnaryExpression":
                return this.evaluateUnary(node, scope);

            case "BinaryExpression":
                return this.evaluateBinary(node, scope);

            case "LogicalExpression":
                return this.evaluateLogical(node, scope);

            case "ConditionalExpression":
                return this.evaluateConditional(node, scope);

            case "ArrayExpression":
                return node.elements.map(el => this.evaluate(el, scope));

            case "ObjectExpression": {
                const obj = {};
                for (const prop of node.properties) {
                    obj[prop.key] = this.evaluate(prop.value, scope);
                }
                return obj;
            }

            default:
                throw new ExpressionError(`Unknown AST node type "${node.type}"`);
        }
    }

    evaluateIdentifier(node, scope) {
        if (scope && typeof scope === "object" && node.name in scope) {
            return scope[node.name];
        }
        return undefined;
    }

    evaluateMember(node, scope) {
        const obj = this.evaluate(node.object, scope);

        if (obj == null) {
            if (node.optional) return undefined;
            return undefined;
        }

        let key;
        if (node.computed) {
            key = this.evaluate(node.property, scope);
        } else {
            key = node.property.name;
        }

        if (typeof obj === "object" || typeof obj === "string" || Array.isArray(obj)) {
            return obj[key];
        }

        return undefined;
    }

    evaluateCall(node, scope) {
        const args = node.arguments.map(arg => this.evaluate(arg, scope));

        if (node.callee.type === "MemberExpression") {
            const targetObj = this.evaluate(node.callee.object, scope);
            if (targetObj != null) {
                let key;
                if (node.callee.computed) {
                    key = this.evaluate(node.callee.property, scope);
                } else {
                    key = node.callee.property.name;
                }
                const method = targetObj[key];
                if (typeof method === "function") {
                    return method.apply(targetObj, args);
                }
            }
            return undefined;
        }

        const fn = this.evaluate(node.callee, scope);
        if (typeof fn === "function") {
            return fn(...args);
        }
        return undefined;
    }

    evaluateUnary(node, scope) {
        const arg = this.evaluate(node.argument, scope);
        switch (node.operator) {
            case "!":
                return !arg;
            case "-":
                return -arg;
            case "+":
                return +arg;
            default:
                throw new ExpressionError(`Unknown unary operator "${node.operator}"`);
        }
    }

    evaluateBinary(node, scope) {
        const left = this.evaluate(node.left, scope);
        const right = this.evaluate(node.right, scope);

        switch (node.operator) {
            case "+":
                return left + right;
            case "-":
                return left - right;
            case "*":
                return left * right;
            case "/":
                return left / right;
            case "%":
                return left % right;

            case "==":
                return left == right;
            case "!=":
                return left != right;
            case "===":
                return left === right;
            case "!==":
                return left !== right;

            case ">":
                return left > right;
            case ">=":
                return left >= right;
            case "<":
                return left < right;
            case "<=":
                return left <= right;

            default:
                throw new ExpressionError(`Unknown binary operator "${node.operator}"`);
        }
    }

    evaluateLogical(node, scope) {
        const left = this.evaluate(node.left, scope);

        switch (node.operator) {
            case "&&":
                return left ? this.evaluate(node.right, scope) : left;
            case "||":
                return left ? left : this.evaluate(node.right, scope);
            case "??":
                return left != null ? left : this.evaluate(node.right, scope);
            default:
                throw new ExpressionError(`Unknown logical operator "${node.operator}"`);
        }
    }

    evaluateConditional(node, scope) {
        const test = this.evaluate(node.test, scope);
        return test ? this.evaluate(node.consequent, scope) : this.evaluate(node.alternate, scope);
    }
}
