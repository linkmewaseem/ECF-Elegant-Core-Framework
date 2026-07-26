import ViewError from "../errors/ViewError.js";

const FOR_EXPRESSION = /^(.+?)\s+as\s+([A-Za-z_$][\w$]*)\s*(?:,\s*([A-Za-z_$][\w$]*))?$/;

const PATTERN =
    /(?<extendsTok>@extends\s*\(\s*(?<extendsBody>[^)]*)\))|(?<sectionOpen>@section\s*\(\s*(?<sectionBody>[^)]*)\))|(?<sectionClose>@endsection\b|@overwrite\b)|(?<sectionShow>@show\b)|(?<yieldTok>@yield\s*\(\s*(?<yieldBody>[^)]*)\))|(?<parentTok>@parent\b)|(?<includeIfTok>@includeIf\s*\(\s*(?<includeIfBody>[^)]*)\))|(?<includeWhenTok>@includeWhen\s*\(\s*(?<includeWhenBody>[^)]*)\))|(?<includeUnlessTok>@includeUnless\s*\(\s*(?<includeUnlessBody>[^)]*)\))|(?<includeFirstTok>@includeFirst\s*\(\s*(?<includeFirstBody>[^)]*)\))|(?<includeTok>@include\s*\(\s*(?<includeBody>[^)]*)\))|(?<ifOpen>@if\s*\(\s*(?<ifCond>[^)]*)\))|(?<elseIf>@elseif\s*\(\s*(?<elseIfCond>[^)]*)\))|(?<elseTok>@else\b)|(?<ifClose>@endif)|(?<forOpen>@(?:for|foreach)\s*\(\s*(?<forExpr>[^)]*)\))|(?<forClose>@endfor|@endforeach)|(?<breakTok>@break\b(?:\s*\(\s*(?<breakCond>[^)]*)\s*\))?)|(?<continueTok>@continue\b(?:\s*\(\s*(?<continueCond>[^)]*)\s*\))?)|(?<switchOpen>@switch\s*\(\s*(?<switchExpr>[^)]*)\))|(?<caseTok>@case\s*\(\s*(?<caseExpr>[^)]*)\))|(?<defaultTok>@default\b)|(?<switchClose>@endswitch)|(?<expr>\{\{(?<exprBody>[\s\S]*?)\}\})/g;

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

            if (groups.extendsTok !== undefined) {
                const layoutExpr = groups.extendsBody.trim();
                if (layoutExpr === "") {
                    throw new ViewError(`Lexer: empty @extends expression at line ${line}, column ${column}.`);
                }
                tokens.push({ type: "Extends", value: layoutExpr, start: matchStart, end: matchEnd, line, column });

            } else if (groups.sectionOpen !== undefined) {
                const parsed = this.parseSectionBody(groups.sectionBody, line, column);
                tokens.push({ type: "SectionOpen", ...parsed, start: matchStart, end: matchEnd, line, column });

            } else if (groups.sectionClose !== undefined) {
                tokens.push({ type: "SectionClose", value: null, start: matchStart, end: matchEnd, line, column });

            } else if (groups.sectionShow !== undefined) {
                tokens.push({ type: "SectionShow", value: null, start: matchStart, end: matchEnd, line, column });

            } else if (groups.yieldTok !== undefined) {
                const parsed = this.parseYieldBody(groups.yieldBody, line, column);
                tokens.push({ type: "Yield", ...parsed, start: matchStart, end: matchEnd, line, column });

            } else if (groups.parentTok !== undefined) {
                tokens.push({ type: "Parent", value: null, start: matchStart, end: matchEnd, line, column });

            } else if (groups.includeTok !== undefined) {
                const parsed = this.parseIncludeBody(groups.includeBody, line, column);
                tokens.push({ type: "Include", mode: "always", ...parsed, start: matchStart, end: matchEnd, line, column });

            } else if (groups.includeIfTok !== undefined) {
                const parsed = this.parseIncludeBody(groups.includeIfBody, line, column);
                tokens.push({ type: "Include", mode: "if", ...parsed, start: matchStart, end: matchEnd, line, column });

            } else if (groups.includeWhenTok !== undefined) {
                const parsed = this.parseConditionalIncludeBody(groups.includeWhenBody, line, column);
                tokens.push({ type: "Include", mode: "when", ...parsed, start: matchStart, end: matchEnd, line, column });

            } else if (groups.includeUnlessTok !== undefined) {
                const parsed = this.parseConditionalIncludeBody(groups.includeUnlessBody, line, column);
                tokens.push({ type: "Include", mode: "unless", ...parsed, start: matchStart, end: matchEnd, line, column });

            } else if (groups.includeFirstTok !== undefined) {
                const parsed = this.parseIncludeBody(groups.includeFirstBody, line, column);
                tokens.push({ type: "Include", mode: "first", ...parsed, start: matchStart, end: matchEnd, line, column });

            } else if (groups.ifOpen !== undefined) {
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

            } else if (groups.switchOpen !== undefined) {
                const condition = groups.switchExpr.trim();
                if (condition === "") {
                    throw new ViewError(`Lexer: empty @switch expression at line ${line}, column ${column}. Write @switch(variable).`);
                }
                tokens.push({ type: "SwitchOpen", value: condition, start: matchStart, end: matchEnd, line, column });

            } else if (groups.caseTok !== undefined) {
                const literal = this.parseCaseLiteral(groups.caseExpr, line, column);
                tokens.push({ type: "Case", value: literal, start: matchStart, end: matchEnd, line, column });

            } else if (groups.defaultTok !== undefined) {
                tokens.push({ type: "Default", value: null, start: matchStart, end: matchEnd, line, column });

            } else if (groups.switchClose !== undefined) {
                tokens.push({ type: "SwitchClose", value: null, start: matchStart, end: matchEnd, line, column });

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

    parseSectionBody(bodyStr, line, column) {
        const text = bodyStr.trim();
        if (text === "") {
            throw new ViewError(`Lexer: empty @section expression at line ${line}, column ${column}.`);
        }

        const commaIdx = this.findTopLevelComma(text);
        if (commaIdx !== -1) {
            const nameExpr = text.slice(0, commaIdx).trim();
            const inlineExpr = text.slice(commaIdx + 1).trim();
            return { nameExpr, inlineExpr: inlineExpr || null };
        }

        return { nameExpr: text, inlineExpr: null };
    }

    parseYieldBody(bodyStr, line, column) {
        const text = bodyStr.trim();
        if (text === "") {
            throw new ViewError(`Lexer: empty @yield expression at line ${line}, column ${column}.`);
        }

        const commaIdx = this.findTopLevelComma(text);
        if (commaIdx !== -1) {
            const nameExpr = text.slice(0, commaIdx).trim();
            const defaultExpr = text.slice(commaIdx + 1).trim();
            return { nameExpr, defaultExpr: defaultExpr || null };
        }

        return { nameExpr: text, defaultExpr: null };
    }

    parseIncludeBody(bodyStr, line, column) {
        const text = bodyStr.trim();
        if (text === "") {
            throw new ViewError(`Lexer: empty @include expression at line ${line}, column ${column}.`);
        }

        const firstCommaIndex = this.findTopLevelComma(text);
        if (firstCommaIndex !== -1) {
            const viewExpr = text.slice(0, firstCommaIndex).trim();
            const dataExpr = text.slice(firstCommaIndex + 1).trim();
            return { viewExpr, dataExpr: dataExpr || null, conditionExpr: null };
        }

        return { viewExpr: text, dataExpr: null, conditionExpr: null };
    }

    parseConditionalIncludeBody(bodyStr, line, column) {
        const text = bodyStr.trim();
        const firstCommaIndex = this.findTopLevelComma(text);
        if (firstCommaIndex === -1) {
            throw new ViewError(`Lexer: @includeWhen / @includeUnless requires condition and view name at line ${line}, column ${column}.`);
        }

        const conditionExpr = text.slice(0, firstCommaIndex).trim();
        const rest = text.slice(firstCommaIndex + 1).trim();

        const secondCommaIndex = this.findTopLevelComma(rest);
        if (secondCommaIndex !== -1) {
            const viewExpr = rest.slice(0, secondCommaIndex).trim();
            const dataExpr = rest.slice(secondCommaIndex + 1).trim();
            return { viewExpr, dataExpr: dataExpr || null, conditionExpr };
        }

        return { viewExpr: rest, dataExpr: null, conditionExpr };
    }

    findTopLevelComma(str) {
        let depthParen = 0;
        let depthBrace = 0;
        let depthBracket = 0;
        let inString = false;
        let stringQuote = null;

        for (let i = 0; i < str.length; i++) {
            const c = str[i];
            if (inString) {
                if (c === stringQuote && str[i - 1] !== "\\") {
                    inString = false;
                }
                continue;
            }
            if (c === '"' || c === "'") {
                inString = true;
                stringQuote = c;
                continue;
            }
            if (c === "(") depthParen++;
            else if (c === ")") depthParen--;
            else if (c === "{") depthBrace++;
            else if (c === "}") depthBrace--;
            else if (c === "[") depthBracket++;
            else if (c === "]") depthBracket--;
            else if (c === "," && depthParen === 0 && depthBrace === 0 && depthBracket === 0) {
                return i;
            }
        }

        return -1;
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

    parseCaseLiteral(raw, line, column) {
        const text = raw.trim();

        if (text === "") {
            throw new ViewError(`Lexer: empty @case value at line ${line}, column ${column}. Use @case("value").`);
        }

        if (/^"(?:[^"\\]|\\.)*"$/.test(text)) {
            return JSON.parse(text);
        }

        if (/^'(?:[^'\\]|\\.)*'$/.test(text)) {
            return text.slice(1, -1).replace(/\\'/g, "'");
        }

        if (text === "true") return true;
        if (text === "false") return false;
        if (text === "null") return null;

        if (/^-?\d+(?:\.\d+)?$/.test(text)) {
            return Number(text);
        }

        throw new ViewError(
            `Lexer: unsupported @case value "${text}" at line ${line}, column ${column}. ` +
            `Only string, number, boolean, and null literals are supported until ExpressionEngine lands.`
        );
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
