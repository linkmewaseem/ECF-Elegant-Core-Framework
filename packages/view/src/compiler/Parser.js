import RootNode from "../ast/RootNode.js";
import TextNode from "../ast/TextNode.js";
import ExpressionNode from "../ast/ExpressionNode.js";
import IfNode from "../ast/IfNode.js";
import ForNode from "../ast/ForNode.js";
import BreakNode from "../ast/BreakNode.js";
import ContinueNode from "../ast/ContinueNode.js";
import ViewError from "../errors/ViewError.js";

const BLOCK_TERMINATORS = new Set(["IfClose", "ElseIf", "Else", "ForClose"]);

export default class Parser {
    parse(tokens) {
        const { children, index } = this.parseBlock(tokens, 0);

        if (index < tokens.length) {
            const orphan = tokens[index];
            throw new ViewError(`Parser: unexpected @${this.describeToken(orphan.type)} without a matching opener at line ${orphan.line}.`);
        }

        return new RootNode(children);
    }

    parseBlock(tokens, startIndex) {
        const children = [];
        let i = startIndex;

        while (i < tokens.length) {
            const token = tokens[i];

            if (BLOCK_TERMINATORS.has(token.type)) {
                return { children, index: i };
            }

            if (token.type === "IfOpen") {
                const parsed = this.parseIf(tokens, i);
                children.push(parsed.node);
                i = parsed.index;
                continue;
            }

            if (token.type === "ForOpen") {
                const parsed = this.parseFor(tokens, i);
                children.push(parsed.node);
                i = parsed.index;
                continue;
            }

            children.push(this.tokenToNode(token));
            i++;
        }

        return { children, index: i };
    }

    parseIf(tokens, ifIndex) {
        const ifToken = tokens[ifIndex];
        let i = ifIndex + 1;

        const { children: consequent, index: afterConsequent } = this.parseBlock(tokens, i);
        i = afterConsequent;

        const elseIfs = [];
        while (i < tokens.length && tokens[i].type === "ElseIf") {
            const elseIfToken = tokens[i];
            i++;
            const { children: body, index: afterBody } = this.parseBlock(tokens, i);
            elseIfs.push({ condition: elseIfToken.value, body });
            i = afterBody;
        }

        let alternate = null;
        if (i < tokens.length && tokens[i].type === "Else") {
            i++;
            const { children: elseBody, index: afterElse } = this.parseBlock(tokens, i);
            alternate = elseBody;
            i = afterElse;
        }

        if (i >= tokens.length || tokens[i].type !== "IfClose") {
            throw new ViewError(`Parser: unclosed @if("${ifToken.value}") at line ${ifToken.line} — missing @endif.`);
        }
        i++;

        return { node: new IfNode(ifToken.value, consequent, alternate, elseIfs), index: i };
    }

    parseFor(tokens, forIndex) {
        const forToken = tokens[forIndex];
        let i = forIndex + 1;

        const { children: body, index: afterBody } = this.parseBlock(tokens, i);
        i = afterBody;

        if (i >= tokens.length || tokens[i].type !== "ForClose") {
            const { iterable, itemName } = forToken.value;
            throw new ViewError(`Parser: unclosed @for("${iterable} as ${itemName}") at line ${forToken.line} — missing @endfor.`);
        }
        i++;

        const { iterable, itemName, indexName } = forToken.value;
        return { node: new ForNode(iterable, itemName, indexName, null, body), index: i };
    }

    tokenToNode(token) {
        switch (token.type) {
            case "Text":
                return new TextNode(token.value);
            case "Expression":
                return new ExpressionNode(token.value);
            case "Break":
                return new BreakNode(token.value);
            case "Continue":
                return new ContinueNode(token.value);
            default:
                throw new ViewError(`Parser: unexpected token type "${token.type}" at line ${token.line}, column ${token.column}.`);
        }
    }

    describeToken(type) {
        switch (type) {
            case "IfClose": return "endif";
            case "ElseIf": return "elseif";
            case "Else": return "else";
            case "ForClose": return "endfor";
            default: return type;
        }
    }
}
