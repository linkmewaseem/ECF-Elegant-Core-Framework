import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Tokenizer from "../../src/expression/Tokenizer.js";
import { TokenType } from "../../src/expression/TokenType.js";

describe("Expression Tokenizer", () => {
    test("tokenizes numbers and strings", () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenize("42 3.14 \"hello\" 'world'");

        assert.equal(tokens[0].type, TokenType.NUMBER);
        assert.equal(tokens[0].value, 42);

        assert.equal(tokens[1].type, TokenType.NUMBER);
        assert.equal(tokens[1].value, 3.14);

        assert.equal(tokens[2].type, TokenType.STRING);
        assert.equal(tokens[2].value, "hello");

        assert.equal(tokens[3].type, TokenType.STRING);
        assert.equal(tokens[3].value, "world");
    });

    test("tokenizes identifiers and keywords", () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenize("user.age true false null undefined");

        assert.equal(tokens[0].type, TokenType.IDENTIFIER);
        assert.equal(tokens[0].value, "user");

        assert.equal(tokens[1].type, TokenType.DOT);

        assert.equal(tokens[2].type, TokenType.IDENTIFIER);
        assert.equal(tokens[2].value, "age");

        assert.equal(tokens[3].type, TokenType.BOOLEAN);
        assert.equal(tokens[3].value, true);

        assert.equal(tokens[4].type, TokenType.BOOLEAN);
        assert.equal(tokens[4].value, false);

        assert.equal(tokens[5].type, TokenType.NULL);
        assert.equal(tokens[5].value, null);

        assert.equal(tokens[6].type, TokenType.UNDEFINED);
        assert.equal(tokens[6].value, undefined);
    });

    test("tokenizes multi-character operators", () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenize("=== !== == != >= <= && || ?? ?.");

        const expected = ["===", "!==", "==", "!=", ">=", "<=", "&&", "||", "??"];
        expected.forEach((op, index) => {
            assert.equal(tokens[index].type, TokenType.OPERATOR);
            assert.equal(tokens[index].value, op);
        });

        assert.equal(tokens[9].type, TokenType.QUESTION_DOT);
        assert.equal(tokens[9].value, "?.");
    });
});
