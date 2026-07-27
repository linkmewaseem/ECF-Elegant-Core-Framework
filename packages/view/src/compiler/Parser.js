import RootNode from "../ast/RootNode.js";
import TextNode from "../ast/TextNode.js";
import ExpressionNode from "../ast/ExpressionNode.js";
import IfNode from "../ast/IfNode.js";
import ForNode from "../ast/ForNode.js";
import BreakNode from "../ast/BreakNode.js";
import ContinueNode from "../ast/ContinueNode.js";
import SwitchNode from "../ast/SwitchNode.js";
import CaseNode from "../ast/CaseNode.js";
import IncludeNode from "../ast/IncludeNode.js";
import ExtendsNode from "../ast/ExtendsNode.js";
import SectionNode from "../ast/SectionNode.js";
import YieldNode from "../ast/YieldNode.js";
import ParentNode from "../ast/ParentNode.js";
import ComponentNode from "../ast/ComponentNode.js";
import SlotNode from "../ast/SlotNode.js";
import PushNode from "../ast/PushNode.js";
import StackNode from "../ast/StackNode.js";
import OnceNode from "../ast/OnceNode.js";
import CacheNode from "../ast/CacheNode.js";
import CustomDirectiveNode from "../ast/CustomDirectiveNode.js";
import ViewError from "../errors/ViewError.js";

const BLOCK_TERMINATORS = new Set([
    "IfClose", "ElseIf", "Else", "ForClose", "Case", "Default", "SwitchClose",
    "SectionClose", "SectionShow", "ComponentClose", "SlotClose", "SlotOpen",
    "PushClose", "OnceClose", "CacheClose"
]);

export default class Parser {
    parse(tokens) {
        const { children, index } = this.parseBlock(tokens, 0);

        if (index < tokens.length) {
            const orphan = tokens[index];
            throw new ViewError(`Parser: unexpected ${this.describeToken(orphan.type)} without a matching opener at line ${orphan.line}.`);
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

            if (token.type === "SwitchOpen") {
                const parsed = this.parseSwitch(tokens, i);
                children.push(parsed.node);
                i = parsed.index;
                continue;
            }

            if (token.type === "SectionOpen") {
                const parsed = this.parseSection(tokens, i);
                children.push(parsed.node);
                i = parsed.index;
                continue;
            }

            if (token.type === "ComponentOpen") {
                const parsed = this.parseComponent(tokens, i);
                children.push(parsed.node);
                i = parsed.index;
                continue;
            }

            if (token.type === "PushOpen") {
                const parsed = this.parsePush(tokens, i);
                children.push(parsed.node);
                i = parsed.index;
                continue;
            }

            if (token.type === "OnceOpen") {
                const parsed = this.parseOnce(tokens, i);
                children.push(parsed.node);
                i = parsed.index;
                continue;
            }

            if (token.type === "CacheOpen") {
                const parsed = this.parseCache(tokens, i);
                children.push(parsed.node);
                i = parsed.index;
                continue;
            }

            children.push(this.tokenToNode(token));
            i++;
        }

        return { children, index: i };
    }

    parseSection(tokens, sectionIndex) {
        const sectionToken = tokens[sectionIndex];
        let i = sectionIndex + 1;

        if (sectionToken.inlineExpr !== null) {
            return {
                node: new SectionNode(sectionToken.nameExpr, sectionToken.inlineExpr, null, false),
                index: i
            };
        }

        const { children: body, index: afterBody } = this.parseBlock(tokens, i);
        i = afterBody;

        if (i >= tokens.length || (tokens[i].type !== "SectionClose" && tokens[i].type !== "SectionShow")) {
            throw new ViewError(`Parser: unclosed @section("${sectionToken.nameExpr}") at line ${sectionToken.line} — missing @endsection or @show.`);
        }

        const terminator = tokens[i];
        const isShown = terminator.type === "SectionShow";
        i++;

        return {
            node: new SectionNode(sectionToken.nameExpr, null, body, isShown),
            index: i
        };
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

    parseSwitch(tokens, switchIndex) {
        const switchToken = tokens[switchIndex];
        let i = switchIndex + 1;

        const { index: afterPreamble } = this.parseBlock(tokens, i);
        i = afterPreamble;

        const cases = [];
        const seenValues = [];
        let defaultBody = null;
        let sawDefault = false;

        while (i < tokens.length && (tokens[i].type === "Case" || tokens[i].type === "Default")) {
            const token = tokens[i];

            if (token.type === "Case") {
                if (seenValues.includes(token.value)) {
                    throw new ViewError(`Parser: duplicate @case(${JSON.stringify(token.value)}) at line ${token.line} inside @switch("${switchToken.value}").`);
                }
                seenValues.push(token.value);

                i++;
                const { children: body, index: afterBody } = this.parseBlock(tokens, i);
                i = afterBody;

                cases.push(new CaseNode(token.value, body));
            } else {
                if (sawDefault) {
                    throw new ViewError(`Parser: duplicate @default at line ${token.line} inside @switch("${switchToken.value}") — only one @default is allowed.`);
                }
                sawDefault = true;

                i++;
                const { children: body, index: afterBody } = this.parseBlock(tokens, i);
                i = afterBody;

                defaultBody = body;
            }
        }

        if (i >= tokens.length || tokens[i].type !== "SwitchClose") {
            throw new ViewError(`Parser: unclosed @switch("${switchToken.value}") at line ${switchToken.line} — missing @endswitch.`);
        }
        i++;

        return { node: new SwitchNode(switchToken.value, cases, defaultBody), index: i };
    }

    tokenToNode(token) {
        switch (token.type) {
            case "Text":
                return new TextNode(token.value);
            case "Expression":
                return new ExpressionNode(token.value, token.escapeMode ?? "escape");
            case "Break":
                return new BreakNode(token.value);
            case "Continue":
                return new ContinueNode(token.value);
            case "Include":
                return new IncludeNode(token.viewExpr, token.dataExpr, token.mode, token.conditionExpr);
            case "Extends":
                return new ExtendsNode(token.value);
            case "Yield":
                return new YieldNode(token.nameExpr, token.defaultExpr);
            case "Parent":
                return new ParentNode();
            case "Stack":
                return new StackNode(token.value);
            case "CustomDirective":
                return new CustomDirectiveNode(token.name, token.value);
            default:
                throw new ViewError(`Parser: unexpected token type "${token.type}" at line ${token.line}, column ${token.column}.`);
        }
    }

    parsePush(tokens, pushIndex) {
        const pushToken = tokens[pushIndex];
        let i = pushIndex + 1;

        const { children: body, index: afterBody } = this.parseBlock(tokens, i);
        i = afterBody;

        if (i >= tokens.length || tokens[i].type !== "PushClose") {
            throw new ViewError(`Parser: unclosed @${pushToken.mode}("${pushToken.value}") at line ${pushToken.line} — missing @end${pushToken.mode}.`);
        }
        i++;

        return { node: new PushNode(pushToken.value, pushToken.mode, body), index: i };
    }

    parseOnce(tokens, onceIndex) {
        const onceToken = tokens[onceIndex];
        let i = onceIndex + 1;

        const { children: body, index: afterBody } = this.parseBlock(tokens, i);
        i = afterBody;

        if (i >= tokens.length || tokens[i].type !== "OnceClose") {
            throw new ViewError(`Parser: unclosed @once at line ${onceToken.line} — missing @endonce.`);
        }
        i++;

        const autoId = `once_${onceToken.line}_${onceToken.column}`;
        return { node: new OnceNode(body, autoId), index: i };
    }

    parseCache(tokens, cacheIndex) {
        const cacheToken = tokens[cacheIndex];
        let i = cacheIndex + 1;

        const { children: body, index: afterBody } = this.parseBlock(tokens, i);
        i = afterBody;

        if (i >= tokens.length || tokens[i].type !== "CacheClose") {
            throw new ViewError(`Parser: unclosed @cache at line ${cacheToken.line} — missing @endcache.`);
        }
        i++;

        return { node: new CacheNode(cacheToken.keyExpr, cacheToken.ttlExpr, body), index: i };
    }

    parseComponent(tokens, compIndex) {
        const compToken = tokens[compIndex];
        let i = compIndex + 1;

        if (compToken.isSelfClosing) {
            return {
                node: new ComponentNode(compToken.componentName, compToken.attributes, [], {}),
                index: i
            };
        }

        const defaultSlot = [];
        const namedSlots = {};

        while (i < tokens.length && tokens[i].type !== "ComponentClose") {
            if (tokens[i].type === "SlotOpen") {
                const parsedSlot = this.parseSlot(tokens, i);
                namedSlots[parsedSlot.node.name] = parsedSlot.node.body;
                i = parsedSlot.index;
                continue;
            }

            const { children, index: afterBlock } = this.parseBlock(tokens, i);
            defaultSlot.push(...children);
            i = afterBlock;
        }

        if (i >= tokens.length || tokens[i].type !== "ComponentClose") {
            throw new ViewError(
                `Parser: unclosed component <x-${compToken.componentName}> at line ${compToken.line} — missing </x-${compToken.componentName}>.`
            );
        }

        const closeToken = tokens[i];
        if (closeToken.componentName !== compToken.componentName) {
            throw new ViewError(
                `Parser: mismatched component tag at line ${closeToken.line}. Expected </x-${compToken.componentName}> but found </x-${closeToken.componentName}>.`
            );
        }
        i++;

        return {
            node: new ComponentNode(compToken.componentName, compToken.attributes, defaultSlot, namedSlots),
            index: i
        };
    }

    parseSlot(tokens, slotIndex) {
        const slotToken = tokens[slotIndex];
        let i = slotIndex + 1;

        const { children: body, index: afterBody } = this.parseBlock(tokens, i);
        i = afterBody;

        if (i >= tokens.length || tokens[i].type !== "SlotClose") {
            throw new ViewError(
                `Parser: unclosed slot <x-slot:${slotToken.name}> at line ${slotToken.line} — missing </x-slot>.`
            );
        }
        i++;

        return {
            node: new SlotNode(slotToken.name, body),
            index: i
        };
    }

    describeToken(type) {
        switch (type) {
            case "IfClose": return "@endif";
            case "ElseIf": return "@elseif";
            case "Else": return "@else";
            case "ForClose": return "@endfor";
            case "Case": return "@case";
            case "Default": return "@default";
            case "SwitchClose": return "@endswitch";
            case "SectionClose": return "@endsection";
            case "SectionShow": return "@show";
            case "ComponentClose": return "</x-...>";
            case "SlotClose": return "</x-slot>";
            case "SlotOpen": return "<x-slot>";
            case "PushClose": return "@endpush";
            case "OnceClose": return "@endonce";
            default: return type;
        }
    }
}
