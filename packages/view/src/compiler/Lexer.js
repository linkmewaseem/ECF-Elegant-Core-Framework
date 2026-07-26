import ViewError from "../errors/ViewError.js";

const FOR_EXPRESSION = /^(.+?)\s+as\s+([A-Za-z_$][\w$]*)\s*(?:,\s*([A-Za-z_$][\w$]*))?$/;

const PATTERN =
    /(?<ifOpen>@if\s*\(\s*(?<ifCond>[^)]*)\))|(?<elseIf>@elseif\s*\(\s*(?<elseIfCond>[^)]*)\))|(?<elseTok>@else\b)|(?<ifClose>@endif)|(?<forOpen>@(?:for|foreach)\s*\(\s*(?<forExpr>[^)]*)\))|(?<forClose>@endfor|@endforeach)|(?<breakTok>@break\b(?:\s*\(\s*(?<breakCond>[^)]*)\s*\))?)|(?<continueTok>@continue\b(?:\s*\(\s*(?<continueCond>[^)]*)\s*\))?)|(?<expr>\{\{(?<exprBody>[\s\S]*?)\}\})/g;

export default class Lexer {
    lex(source) {
        if (typeof source !== "string") {
            throw new ViewError("Lexer.lex() requires a string source.");
        }

        if (source.length === 0) {
            return [];
        }

        const tokens = [];
        const regex = new RegExp(PATTERN.source, "g");
        let lastIndex = 0;
        let line = 1;
        let column = 1;

        let match;
        while ((match = regex.exec(source)) !== null) {
            const matchStart = match.index;
            const matchEnd = regex.lastIndex;

            if (matchStart > lastIndex) {
                const textValue = source.slice(lastIndex, matchStart);
                tokens.push({ type: "Text", value: textValue, start: lastIndex, end: matchStart, line, column });
                ({ line, column } = this.advancePosition(textValue, line, column));
            }

            const { groups } = match;

            if (groups.ifOpen !== undefined) {
                const condition = groups.ifCond.trim();
                if (condition === "") {
                    throw new ViewError(`Lexer: empty @if condition at line ${line}, column ${column}. Write @if(variable).`);
                }
                tokens.push({ type: "IfOpen", value: condition, start: matchStart, end: matchEnd, line, column });

            } else if (groups.elseIf !== undefined) {
                const condition = groups.elseIfCond.trim();
                if (condition === "") {
                    throw new ViewError(`Lexer: empty @elseif condition at line ${line}, column ${column}. Write @elseif(variable).`);
                }
                tokens.push({ type: "ElseIf", value: condition, start: matchStart, end: matchEnd, line, column });

            } else if (groups.elseTok !== undefined) {
                tokens.push({ type: "Else", value: null, start: matchStart, end: matchEnd, line, column });

            } else if (groups.ifClose !== undefined) {
                tokens.push({ type: "IfClose", value: null, start: matchStart, end: matchEnd, line, column });

            } else if (groups.forOpen !== undefined) {
                const forExpr = this.parseForExpression(groups.forExpr.trim(), line, column);
                tokens.push({ type: "ForOpen", value: forExpr, start: matchStart, end: matchEnd, line, column });

            } else if (groups.forClose !== undefined) {
                tokens.push({ type: "ForClose", value: null, start: matchStart, end: matchEnd, line, column });

            } else if (groups.breakTok !== undefined) {
                const condition = groups.breakCond !== undefined ? groups.breakCond.trim() : null;
                if (condition === "") {
                    throw new ViewError(`Lexer: empty @break condition at line ${line}, column ${column}. Use bare @break or @break(condition).`);
                }
                tokens.push({ type: "Break", value: condition, start: matchStart, end: matchEnd, line, column });

            } else if (groups.continueTok !== undefined) {
                const condition = groups.continueCond !== undefined ? groups.continueCond.trim() : null;
                if (condition === "") {
                    throw new ViewError(`Lexer: empty @continue condition at line ${line}, column ${column}. Use bare @continue or @continue(condition).`);
                }
                tokens.push({ type: "Continue", value: condition, start: matchStart, end: matchEnd, line, column });

            } else if (groups.expr !== undefined) {
                const exprValue = groups.exprBody.trim();
                if (exprValue === "") {
                    throw new ViewError(`Lexer: empty expression at line ${line}, column ${column}. Did you mean to write {{ variable }}?`);
                }
                tokens.push({ type: "Expression", value: exprValue, start: matchStart, end: matchEnd, line, column });
            }

            ({ line, column } = this.advancePosition(match[0], line, column));
            lastIndex = matchEnd;
        }

        if (lastIndex < source.length) {
            const textValue = source.slice(lastIndex);
            tokens.push({ type: "Text", value: textValue, start: lastIndex, end: source.length, line, column });
        }

        return tokens;
    }

    parseForExpression(expr, line, column) {
        const match = FOR_EXPRESSION.exec(expr);
        if (!match) {
            throw new ViewError(
                `Lexer: invalid @for expression "${expr}" at line ${line}, column ${column}. Expected "items as item" or "items as item, index".`
            );
        }
        const [, iterable, itemName, indexName] = match;
        return { iterable: iterable.trim(), itemName, indexName: indexName ?? null };
    }

    advancePosition(text, line, column) {
        for (const ch of text) {
            if (ch === "\n") {
                line++;
                column = 1;
            } else {
                column++;
            }
        }
        return { line, column };
    }
}
