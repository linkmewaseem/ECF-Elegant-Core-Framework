import { TokenType } from "./TokenType.js";
import ExpressionError from "./errors/ExpressionError.js";
import LiteralNode from "./ast/LiteralNode.js";
import IdentifierNode from "./ast/IdentifierNode.js";
import MemberExpressionNode from "./ast/MemberExpressionNode.js";
import CallExpressionNode from "./ast/CallExpressionNode.js";
import UnaryExpressionNode from "./ast/UnaryExpressionNode.js";
import BinaryExpressionNode from "./ast/BinaryExpressionNode.js";
import LogicalExpressionNode from "./ast/LogicalExpressionNode.js";
import ConditionalExpressionNode from "./ast/ConditionalExpressionNode.js";
import ArrayExpressionNode from "./ast/ArrayExpressionNode.js";
import ObjectExpressionNode from "./ast/ObjectExpressionNode.js";

export default class Parser {
    parse(tokens) {
        if (!Array.isArray(tokens) || tokens.length === 0) {
            throw new ExpressionError("Parser requires a non-empty array of tokens.");
        }

        this.tokens = tokens;
        this.current = 0;

        const expr = this.parseExpression();

        if (this.peek().type !== TokenType.EOF) {
            const token = this.peek();
            throw new ExpressionError(`Unexpected token "${token.value}"`, token.start);
        }

        return expr;
    }

    parseExpression() {
        return this.parseTernary();
    }

    // 1. Ternary Expression: test ? consequent : alternate
    parseTernary() {
        const expr = this.parseNullishCoalescing();

        if (this.match(TokenType.QUESTION)) {
            const consequent = this.parseExpression();
            this.expect(TokenType.COLON, "Expected \":\" in ternary expression");
            const alternate = this.parseExpression();
            return new ConditionalExpressionNode(expr, consequent, alternate);
        }

        return expr;
    }

    // 2. Nullish Coalescing: left ?? right
    parseNullishCoalescing() {
        let left = this.parseLogicalOr();

        while (this.isOperator("??")) {
            const op = this.advance().value;
            const right = this.parseLogicalOr();
            left = new LogicalExpressionNode(op, left, right);
        }

        return left;
    }

    // 3. Logical OR: left || right
    parseLogicalOr() {
        let left = this.parseLogicalAnd();

        while (this.isOperator("||")) {
            const op = this.advance().value;
            const right = this.parseLogicalAnd();
            left = new LogicalExpressionNode(op, left, right);
        }

        return left;
    }

    // 4. Logical AND: left && right
    parseLogicalAnd() {
        let left = this.parseEquality();

        while (this.isOperator("&&")) {
            const op = this.advance().value;
            const right = this.parseEquality();
            left = new LogicalExpressionNode(op, left, right);
        }

        return left;
    }

    // 5. Equality: ==, !=, ===, !==
    parseEquality() {
        let left = this.parseRelational();

        while (this.isOperator("==", "!=", "===", "!==")) {
            const op = this.advance().value;
            const right = this.parseRelational();
            left = new BinaryExpressionNode(op, left, right);
        }

        return left;
    }

    // 6. Relational: <, <=, >, >=
    parseRelational() {
        let left = this.parseAdditive();

        while (this.isOperator("<", "<=", ">", ">=")) {
            const op = this.advance().value;
            const right = this.parseAdditive();
            left = new BinaryExpressionNode(op, left, right);
        }

        return left;
    }

    // 7. Additive: +, -
    parseAdditive() {
        let left = this.parseMultiplicative();

        while (this.isOperator("+", "-")) {
            const op = this.advance().value;
            const right = this.parseMultiplicative();
            left = new BinaryExpressionNode(op, left, right);
        }

        return left;
    }

    // 8. Multiplicative: *, /, %
    parseMultiplicative() {
        let left = this.parseUnary();

        while (this.isOperator("*", "/", "%")) {
            const op = this.advance().value;
            const right = this.parseUnary();
            left = new BinaryExpressionNode(op, left, right);
        }

        return left;
    }

    // 9. Unary: !, -, +
    parseUnary() {
        if (this.isOperator("!", "-", "+")) {
            const op = this.advance().value;
            const argument = this.parseUnary();
            return new UnaryExpressionNode(op, argument);
        }

        return this.parseMember();
    }

    // 10. Member access: obj.prop, obj?.prop, obj[key]
    parseMember() {
        let object = this.parsePrimary();

        while (true) {
            if (this.match(TokenType.DOT)) {
                const propToken = this.expect(TokenType.IDENTIFIER, "Expected property name after \".\"");
                object = new MemberExpressionNode(object, new IdentifierNode(propToken.value), false, false);
            } else if (this.match(TokenType.QUESTION_DOT)) {
                const propToken = this.expect(TokenType.IDENTIFIER, "Expected property name after \"?.\"");
                object = new MemberExpressionNode(object, new IdentifierNode(propToken.value), false, true);
            } else if (this.match(TokenType.LBRACKET)) {
                const property = this.parseExpression();
                this.expect(TokenType.RBRACKET, "Expected \"]\" after computed property");
                object = new MemberExpressionNode(object, property, true, false);
            } else if (this.match(TokenType.LPAREN)) {
                const args = [];
                if (this.peek().type !== TokenType.RPAREN) {
                    while (true) {
                        args.push(this.parseExpression());
                        if (!this.match(TokenType.COMMA)) break;
                    }
                }
                this.expect(TokenType.RPAREN, "Expected \")\" after arguments");
                object = new CallExpressionNode(object, args);
            } else {
                break;
            }
        }

        return object;
    }

    // 11. Primary Expressions
    parsePrimary() {
        const token = this.peek();

        if (token.type === TokenType.NUMBER || token.type === TokenType.STRING ||
            token.type === TokenType.BOOLEAN || token.type === TokenType.NULL ||
            token.type === TokenType.UNDEFINED) {
            this.advance();
            return new LiteralNode(token.value);
        }

        if (token.type === TokenType.IDENTIFIER) {
            this.advance();
            return new IdentifierNode(token.value);
        }

        if (this.match(TokenType.LPAREN)) {
            const expr = this.parseExpression();
            this.expect(TokenType.RPAREN, "Expected \")\" after expression");
            return expr;
        }

        if (this.match(TokenType.LBRACKET)) {
            const elements = [];
            if (this.peek().type !== TokenType.RBRACKET) {
                while (true) {
                    elements.push(this.parseExpression());
                    if (!this.match(TokenType.COMMA)) break;
                }
            }
            this.expect(TokenType.RBRACKET, "Expected \"]\" at end of array literal");
            return new ArrayExpressionNode(elements);
        }

        if (this.match(TokenType.LBRACE)) {
            const properties = [];
            if (this.peek().type !== TokenType.RBRACE) {
                while (true) {
                    let key;
                    const keyToken = this.peek();
                    if (keyToken.type === TokenType.IDENTIFIER || keyToken.type === TokenType.STRING) {
                        key = keyToken.value;
                        this.advance();
                    } else {
                        throw new ExpressionError(`Expected property key in object literal at position ${keyToken.start}`, keyToken.start);
                    }
                    this.expect(TokenType.COLON, "Expected \":\" after key in object literal");
                    const val = this.parseExpression();
                    properties.push({ key, value: val });
                    if (!this.match(TokenType.COMMA)) break;
                }
            }
            this.expect(TokenType.RBRACE, "Expected \"}\" at end of object literal");
            return new ObjectExpressionNode(properties);
        }

        throw new ExpressionError(`Unexpected token "${token.value ?? token.type}"`, token.start);
    }

    // Helper methods
    peek() {
        return this.tokens[this.current];
    }

    advance() {
        const token = this.tokens[this.current];
        if (token.type !== TokenType.EOF) {
            this.current++;
        }
        return token;
    }

    match(type) {
        if (this.peek().type === type) {
            this.advance();
            return true;
        }
        return false;
    }

    isOperator(...ops) {
        const token = this.peek();
        return token.type === TokenType.OPERATOR && ops.includes(token.value);
    }

    expect(type, errorMessage) {
        const token = this.peek();
        if (token.type === type) {
            return this.advance();
        }
        throw new ExpressionError(errorMessage, token.start);
    }
}
