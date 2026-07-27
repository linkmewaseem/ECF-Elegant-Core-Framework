import ViewError from "../errors/ViewError.js";
import lookup from "../utils/lookup.js";
import Evaluator from "../expression/Evaluator.js";
import RenderContext from "../runtime/RenderContext.js";
import AttributeBag from "../runtime/AttributeBag.js";

const evaluator = new Evaluator();

export default class CodeGenerator {
    generate(ast) {
        if (!ast || (ast.type !== "Root" && ast.type !== "RootNode")) {
            throw new ViewError("CodeGenerator.generate() requires a Root AST node.");
        }

        return function render(data = {}, context = null) {
            const renderContext = context ?? data.__renderContext ?? new RenderContext();
            data.__renderContext = renderContext;

            let html = CodeGenerator.renderNodes(ast.children, data, renderContext, null, null, null);

            if (renderContext.extendedLayout) {
                const vm = data.__viewManager;
                if (!vm) {
                    throw new ViewError("@extends directive requires a ViewManager instance in render data (__viewManager).");
                }
                const layoutName = renderContext.extendedLayout;
                renderContext.extendedLayout = null;
                return vm.renderSync(layoutName, data, renderContext);
            }

            return html;
        };
    }

    static evalExpr(node, astProp, rawProp, data) {
        if (node[astProp]) {
            return evaluator.evaluate(node[astProp], data);
        }
        return lookup(data, node[rawProp]);
    }

    static renderNodes(nodes, data, context, nearestLoop = null, nearestBreakable = null, parentEvaluator = null) {
        let html = "";

        for (const node of nodes) {
            if (node.type === "BreakNode") {
                if (!nearestBreakable) {
                    throw new ViewError("@break used outside of a @for or @switch.");
                }
                const shouldTrigger = node.condition === null || (
                    node.conditionAst
                        ? evaluator.evaluate(node.conditionAst, data)
                        : lookup(data, node.condition)
                );
                if (shouldTrigger) {
                    nearestBreakable.break = true;
                    break;
                }
                continue;
            }

            if (node.type === "ContinueNode") {
                if (!nearestLoop) {
                    throw new ViewError("@continue used outside of a @for loop.");
                }
                const shouldTrigger = node.condition === null || (
                    node.conditionAst
                        ? evaluator.evaluate(node.conditionAst, data)
                        : lookup(data, node.condition)
                );
                if (shouldTrigger) {
                    nearestLoop.continue = true;
                    break;
                }
                continue;
            }

            html += CodeGenerator.renderNode(node, data, context, nearestLoop, nearestBreakable, parentEvaluator);

            if (nearestBreakable?.break || nearestLoop?.continue) {
                break;
            }
        }

        return html;
    }

    static renderNode(node, data, context, nearestLoop = null, nearestBreakable = null, parentEvaluator = null) {
        switch (node.type) {
            case "TextNode":
                return node.value;

            case "ExpressionNode": {
                const value = CodeGenerator.evalExpr(node, "expressionAst", "expression", data);
                return value !== undefined && value !== null ? String(value) : "";
            }

            case "ExtendsNode": {
                const layoutName = CodeGenerator.evalExpr(node, "layoutExprAst", "layoutExpr", data);
                context.extendedLayout = layoutName;
                return "";
            }

            case "SectionNode": {
                const sectionName = CodeGenerator.evalExpr(node, "nameExprAst", "nameExpr", data);
                if (node.inlineExpr !== null) {
                    const inlineVal = CodeGenerator.evalExpr(node, "inlineExprAst", "inlineExpr", data);
                    const valStr = inlineVal !== undefined && inlineVal !== null ? String(inlineVal) : "";
                    context.addSection(sectionName, valStr);
                    return "";
                } else if (node.body !== null) {
                    context.addSection(sectionName, (scopeData, pEval, cg) => {
                        return cg.renderNodes(node.body, scopeData, context, nearestLoop, nearestBreakable, pEval);
                    });
                    if (node.isShown) {
                        return context.renderSection(sectionName, "", data, CodeGenerator);
                    }
                    return "";
                }
                return "";
            }

            case "YieldNode": {
                const sectionName = CodeGenerator.evalExpr(node, "nameExprAst", "nameExpr", data);
                const defaultVal = node.defaultExpr
                    ? CodeGenerator.evalExpr(node, "defaultExprAst", "defaultExpr", data)
                    : "";
                const fallbackStr = defaultVal !== undefined && defaultVal !== null ? String(defaultVal) : "";
                return context.renderSection(sectionName, fallbackStr, data, CodeGenerator);
            }

            case "ParentNode": {
                if (typeof parentEvaluator === "function") {
                    return parentEvaluator();
                }
                return "";
            }

            case "IncludeNode":
                return CodeGenerator.renderInclude(node, data, context);

            case "ComponentNode":
                return CodeGenerator.renderComponent(node, data, context);

            case "IfNode": {
                const mainCond = CodeGenerator.evalExpr(node, "conditionAst", "condition", data);
                if (mainCond) {
                    return CodeGenerator.renderNodes(node.consequent, data, context, nearestLoop, nearestBreakable, parentEvaluator);
                }
                for (const elseIf of node.elseIfs ?? []) {
                    const elseIfCond = elseIf.conditionAst
                        ? evaluator.evaluate(elseIf.conditionAst, data)
                        : lookup(data, elseIf.condition);
                    if (elseIfCond) {
                        return CodeGenerator.renderNodes(elseIf.body, data, context, nearestLoop, nearestBreakable, parentEvaluator);
                    }
                }
                return node.alternate ? CodeGenerator.renderNodes(node.alternate, data, context, nearestLoop, nearestBreakable, parentEvaluator) : "";
            }

            case "ForNode":
                return CodeGenerator.renderFor(node, data, context, parentEvaluator);

            case "SwitchNode":
                return CodeGenerator.renderSwitch(node, data, context, nearestLoop, parentEvaluator);

            case "BreakNode":
                throw new ViewError("@break used outside of a @for or @switch.");

            case "ContinueNode":
                throw new ViewError("@continue used outside of a @for loop.");

            default:
                throw new ViewError(`CodeGenerator: unknown AST node type "${node.type}".`);
        }
    }

    static renderInclude(node, data, context) {
        const vm = data.__viewManager;
        if (!vm) {
            throw new ViewError("@include directive requires a ViewManager instance in render data (__viewManager).");
        }

        const rawViewName = CodeGenerator.evalExpr(node, "viewExprAst", "viewExpr", data);
        const extraData = node.dataExprAst
            ? evaluator.evaluate(node.dataExprAst, data)
            : (node.dataExpr ? lookup(data, node.dataExpr) : null);

        const childScope = { ...data, ...(extraData && typeof extraData === "object" ? extraData : {}) };

        switch (node.mode) {
            case "always":
                return vm.renderSync(rawViewName, childScope, context);

            case "if":
                if (vm.existsSync(rawViewName)) {
                    return vm.renderSync(rawViewName, childScope, context);
                }
                return "";

            case "when": {
                const cond = node.conditionExprAst
                    ? evaluator.evaluate(node.conditionExprAst, data)
                    : lookup(data, node.conditionExpr);
                if (cond) {
                    return vm.renderSync(rawViewName, childScope, context);
                }
                return "";
            }

            case "unless": {
                const cond = node.conditionExprAst
                    ? evaluator.evaluate(node.conditionExprAst, data)
                    : lookup(data, node.conditionExpr);
                if (!cond) {
                    return vm.renderSync(rawViewName, childScope, context);
                }
                return "";
            }

            case "first": {
                const names = Array.isArray(rawViewName) ? rawViewName : [rawViewName];
                for (const name of names) {
                    if (vm.existsSync(name)) {
                        return vm.renderSync(name, childScope, context);
                    }
                }
                throw new ViewError(`@includeFirst: None of the views [${names.join(", ")}] exist.`);
            }

            default:
                throw new ViewError(`Unknown include mode "${node.mode}".`);
        }
    }

    static renderComponent(node, data, context) {
        const vm = data.__viewManager;
        if (!vm) {
            throw new ViewError("<x-...> component tags require a ViewManager instance in render data (__viewManager).");
        }

        let componentViewName = `components.${node.componentName}`;
        if (!vm.existsSync(componentViewName)) {
            if (vm.existsSync(node.componentName)) {
                componentViewName = node.componentName;
            } else {
                throw new ViewError(`Component view "${componentViewName}" (or "${node.componentName}") not found.`);
            }
        }

        const props = {};
        const unhandledAttrs = {};

        for (const attr of node.attributes) {
            let val;
            if (attr.isBoolean) {
                val = true;
            } else if (attr.isDynamic) {
                val = attr.valueAst
                    ? evaluator.evaluate(attr.valueAst, data)
                    : lookup(data, attr.value);
            } else {
                val = attr.value;
            }

            props[attr.name] = val;
            unhandledAttrs[attr.name] = val;
        }

        const attributeBag = AttributeBag.create(unhandledAttrs);

        const defaultSlotHtml = CodeGenerator.renderNodes(node.defaultSlot, data, context);
        const namedSlotsHtml = {};

        for (const [slotName, slotNodes] of Object.entries(node.namedSlots)) {
            namedSlotsHtml[slotName] = CodeGenerator.renderNodes(slotNodes, data, context);
        }

        const componentScope = {
            ...props,
            $attributes: attributeBag,
            $slot: defaultSlotHtml,
            __viewManager: vm,
            __renderContext: context
        };

        for (const [slotName, slotHtml] of Object.entries(namedSlotsHtml)) {
            componentScope[`$${slotName}`] = slotHtml;
        }

        return vm.renderSync(componentViewName, componentScope, context);
    }

    static renderFor(node, data, context, parentEvaluator) {
        const items = CodeGenerator.evalExpr(node, "iterableAst", "iterable", data);

        if (!Array.isArray(items)) {
            throw new ViewError(
                `@for expected "${node.iterable}" to be iterable. Received: ${CodeGenerator.describeValue(items)}.`
            );
        }

        let html = "";

        for (const [index, item] of items.entries()) {
            const scope = { ...data, [node.itemName]: item };
            if (node.indexName) {
                scope[node.indexName] = index;
            }

            const ctx = { break: false, continue: false };
            html += CodeGenerator.renderNodes(node.body, scope, context, ctx, ctx, parentEvaluator);

            if (ctx.break) {
                break;
            }
        }

        return html;
    }

    static renderSwitch(node, data, context, nearestLoop, parentEvaluator) {
        const switchVal = CodeGenerator.evalExpr(node, "expressionAst", "expression", data);

        for (const caseNode of node.cases) {
            const caseVal = caseNode.valueAst
                ? evaluator.evaluate(caseNode.valueAst, data)
                : caseNode.value;

            if (switchVal === caseVal) {
                const switchCtx = { break: false };
                return CodeGenerator.renderNodes(caseNode.body, data, context, nearestLoop, switchCtx, parentEvaluator);
            }
        }

        if (node.defaultBody) {
            const switchCtx = { break: false };
            return CodeGenerator.renderNodes(node.defaultBody, data, context, nearestLoop, switchCtx, parentEvaluator);
        }

        return "";
    }

    static describeValue(value) {
        if (value === undefined) return "undefined";
        if (value === null) return "null";
        if (typeof value === "object") {
            try {
                return JSON.stringify(value);
            } catch {
                return "[object]";
            }
        }
        return String(value);
    }
}
