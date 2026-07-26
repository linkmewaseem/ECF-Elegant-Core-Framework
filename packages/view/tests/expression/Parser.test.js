import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Tokenizer from "../../src/expression/Tokenizer.js";
import Parser from "../../src/expression/Parser.js";

describe("Expression Parser", () => {
    const parse = (expr) => {
        const tokens = new Tokenizer().tokenize(expr);
        return new Parser().parse(tokens);
    };

    test("parses member expressions and binary ops", () => {
        const ast = parse("user.age >= 18");
        assert.equal(ast.type, "BinaryExpression");
        assert.equal(ast.operator, ">=");
        assert.equal(ast.left.type, "MemberExpression");
        assert.equal(ast.left.object.name, "user");
        assert.equal(ast.left.property.name, "age");
        assert.equal(ast.right.type, "Literal");
        assert.equal(ast.right.value, 18);
    });

    test("parses logical expressions with operator precedence", () => {
        const ast = parse("a || b && c");
        assert.equal(ast.type, "LogicalExpression");
        assert.equal(ast.operator, "||");
        assert.equal(ast.left.name, "a");
        assert.equal(ast.right.type, "LogicalExpression");
        assert.equal(ast.right.operator, "&&");
    });

    test("parses ternary conditional expressions", () => {
        const ast = parse("active ? 'yes' : 'no'");
        assert.equal(ast.type, "ConditionalExpression");
        assert.equal(ast.test.name, "active");
        assert.equal(ast.consequent.value, "yes");
        assert.equal(ast.alternate.value, "no");
    });

    test("parses optional chaining and bracket member access", () => {
        const ast = parse("user?.address['city']");
        assert.equal(ast.type, "MemberExpression");
        assert.equal(ast.computed, true);
        assert.equal(ast.object.type, "MemberExpression");
        assert.equal(ast.object.optional, true);
    });

    test("parses array literals", () => {
        const ast = parse("[1, 2, user.score]");
        assert.equal(ast.type, "ArrayExpression");
        assert.equal(ast.elements.length, 3);
        assert.equal(ast.elements[0].value, 1);
        assert.equal(ast.elements[1].value, 2);
        assert.equal(ast.elements[2].type, "MemberExpression");
    });
});
