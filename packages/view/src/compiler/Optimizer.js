import RootNode from "../ast/RootNode.js";
import TextNode from "../ast/TextNode.js";

export default class Optimizer {
    optimize(ast) {
        return new RootNode(this.mergeAdjacentTextNodes(ast.children));
    }

    mergeAdjacentTextNodes(nodes) {
        const merged = [];
        for (const node of nodes) {
            const previous = merged[merged.length - 1];
            if (node.type === "TextNode" && previous?.type === "TextNode") {
                merged[merged.length - 1] = new TextNode(previous.value + node.value);
                continue;
            }
            merged.push(node);
        }
        return merged;
    }
}
