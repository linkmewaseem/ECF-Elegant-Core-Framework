import { TokenType } from "./TokenType.js";
import ExpressionError from "./errors/ExpressionError.js";

export default class Tokenizer {
    tokenize(source) {
        if (typeof source !== "string") {
            throw new ExpressionError("Tokenizer requires a string source.");
        }

        const tokens = [];
        let i = 0;
        const len = source.length;

        while (i < len) {
            const char = source[i];

            // Skip whitespace
            if (/\s/.test(char)) {
                i++;
                continue;
            }

            // Numbers
            if (/\d/.test(char) || (char === "." && i + 1 < len && /\d/.test(source[i + 1]))) {
                const start = i;
                let hasDot = false;

                while (i < len) {
                    const c = source[i];
                    if (c === ".") {
                        if (hasDot) break;
                        hasDot = true;
                    } else if (!/\d/.test(c)) {
                        break;
                    }
                    i++;
                }

                const numStr = source.slice(start, i);
                tokens.push({ type: TokenType.NUMBER, value: Number(numStr), start, end: i });
                continue;
            }

            // Strings
            if (char === '"' || char === "'") {
                const quote = char;
                const start = i;
                i++; // Skip opening quote
                let strVal = "";
                let closed = false;

                while (i < len) {
                    const c = source[i];
                    if (c === "\\") {
                        if (i + 1 < len) {
                            const next = source[i + 1];
                            if (next === "n") strVal += "\n";
                            else if (next === "r") strVal += "\r";
                            else if (next === "t") strVal += "\t";
                            else strVal += next;
                            i += 2;
                            continue;
                        }
                    }
                    if (c === quote) {
                        closed = true;
                        i++;
                        break;
                    }
                    strVal += c;
                    i++;
                }

                if (!closed) {
                    throw new ExpressionError(`Unclosed string literal starting with ${quote}`, start);
                }

                tokens.push({ type: TokenType.STRING, value: strVal, start, end: i });
                continue;
            }

            // Identifiers / Keywords
            if (/[a-zA-Z_$]/.test(char)) {
                const start = i;
                while (i < len && /[a-zA-Z0-9_$]/.test(source[i])) {
                    i++;
                }
                const name = source.slice(start, i);

                if (name === "true") {
                    tokens.push({ type: TokenType.BOOLEAN, value: true, start, end: i });
                } else if (name === "false") {
                    tokens.push({ type: TokenType.BOOLEAN, value: false, start, end: i });
                } else if (name === "null") {
                    tokens.push({ type: TokenType.NULL, value: null, start, end: i });
                } else if (name === "undefined") {
                    tokens.push({ type: TokenType.UNDEFINED, value: undefined, start, end: i });
                } else {
                    tokens.push({ type: TokenType.IDENTIFIER, value: name, start, end: i });
                }
                continue;
            }

            // Multi-char operators & Punctuators
            const start = i;
            const twoChar = source.slice(i, i + 2);
            const threeChar = source.slice(i, i + 3);

            if (threeChar === "===" || threeChar === "!==") {
                tokens.push({ type: TokenType.OPERATOR, value: threeChar, start, end: i + 3 });
                i += 3;
                continue;
            }

            if (twoChar === "==" || twoChar === "!=" || twoChar === ">=" || twoChar === "<=" ||
                twoChar === "&&" || twoChar === "||" || twoChar === "??") {
                tokens.push({ type: TokenType.OPERATOR, value: twoChar, start, end: i + 2 });
                i += 2;
                continue;
            }

            if (twoChar === "?.") {
                tokens.push({ type: TokenType.QUESTION_DOT, value: "?.", start, end: i + 2 });
                i += 2;
                continue;
            }

            // Single char punctuators & operators
            if (char === ".") {
                tokens.push({ type: TokenType.DOT, value: ".", start, end: i + 1 });
                i++;
                continue;
            }
            if (char === "(") {
                tokens.push({ type: TokenType.LPAREN, value: "(", start, end: i + 1 });
                i++;
                continue;
            }
            if (char === ")") {
                tokens.push({ type: TokenType.RPAREN, value: ")", start, end: i + 1 });
                i++;
                continue;
            }
            if (char === "{") {
                tokens.push({ type: TokenType.LBRACE, value: "{", start: i, end: i + 1 });
                i++;
                continue;
            }
            if (char === "}") {
                tokens.push({ type: TokenType.RBRACE, value: "}", start: i, end: i + 1 });
                i++;
                continue;
            }
            if (char === "[") {
                tokens.push({ type: TokenType.LBRACKET, value: "[", start, end: i + 1 });
                i++;
                continue;
            }
            if (char === "]") {
                tokens.push({ type: TokenType.RBRACKET, value: "]", start, end: i + 1 });
                i++;
                continue;
            }
            if (char === ",") {
                tokens.push({ type: TokenType.COMMA, value: ",", start, end: i + 1 });
                i++;
                continue;
            }
            if (char === "?") {
                tokens.push({ type: TokenType.QUESTION, value: "?", start, end: i + 1 });
                i++;
                continue;
            }
            if (char === ":") {
                tokens.push({ type: TokenType.COLON, value: ":", start, end: i + 1 });
                i++;
                continue;
            }

            if ("+-*/%><!".includes(char)) {
                tokens.push({ type: TokenType.OPERATOR, value: char, start, end: i + 1 });
                i++;
                continue;
            }

            throw new ExpressionError(`Unexpected character "${char}"`, i);
        }

        tokens.push({ type: TokenType.EOF, value: null, start: len, end: len });
        return tokens;
    }
}
