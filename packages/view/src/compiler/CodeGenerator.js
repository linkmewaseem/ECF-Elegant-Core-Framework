import ViewError from "../errors/ViewError.js";
import lookup from "../utils/lookup.js";

export default class CodeGenerator {
    generate(ast) {
        if (!ast || ast.type !== "Root") {
            throw new ViewError("CodeGenerator.generate() requires a Root AST node.");
        }

        return function render(data = {}) {
            return CodeGenerator.renderNodes(ast.children, data, null);
        };
    }

    // Renders an array of sibling nodes. `loop` (if present) is the shared
    // control-signal object for the nearest enclosing @for iteration.
    static renderNodes(nodes, data, loop) {
        let html = "";

        for (const node of nodes) {
            if (node.type === "BreakNode" || node.type === "ContinueNode") {
                if (!loop) {
                    const directive = node.type === "BreakNode" ? "break" : "continue";
                    throw new ViewError(`@${directive} used outside of a @for loop.`);
                }

                const shouldTrigger = node.condition === null || lookup(data, node.condition);
                if (shouldTrigger) {
                    loop.signal = node.type === "BreakNode" ? "break" : "continue";
                    break; // stop rendering the rest of this body immediately
                }
                continue; // condition false — this @break/@continue does nothing this time
            }

            html += CodeGenerator.renderNode(node, data, loop);

            if (loop?.signal === "break" || loop?.signal === "continue") {
                break; // a nested @if already triggered break/continue — stop here too
            }
        }

        return html;
    }

    static renderNode(node, data, loop = null) {
        switch (node.type) {
            case "TextNode":
                return node.value;

            case "ExpressionNode": {
                const value = lookup(data, node.expression);
                return value !== undefined && value !== null ? String(value) : "";
            }

            case "IfNode": {
                if (lookup(data, node.condition)) {
                    return CodeGenerator.renderNodes(node.consequent, data, loop);
                }
                for (const elseIf of node.elseIfs ?? []) {
                    if (lookup(data, elseIf.condition)) {
                        return CodeGenerator.renderNodes(elseIf.body, data, loop);
                    }
                }
                return node.alternate ? CodeGenerator.renderNodes(node.alternate, data, loop) : "";
            }

            case "ForNode":
                return CodeGenerator.renderFor(node, data);

            case "BreakNode":
            case "ContinueNode":
                // Only reached if renderNode() is called directly on one of these
                // (e.g. a unit test) instead of via renderNodes(). Same rule applies.
                throw new ViewError(`@${node.type === "BreakNode" ? "break" : "continue"} used outside of a @for loop.`);

            default:
                throw new ViewError(`CodeGenerator: unknown AST node type "${node.type}".`);
        }
    }

    static renderFor(node, data) {
        const items = lookup(data, node.iterable);

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

            const loop = { signal: null }; // fresh per iteration, targets the NEAREST @for
            html += CodeGenerator.renderNodes(node.body, scope, loop);

            if (loop.signal === "break") {
                break;
            }
            if (loop.signal === "continue") {
                loop.signal = null;
            }
        }

        return html;
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
