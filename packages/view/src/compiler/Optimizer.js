import RootNode from "../ast/RootNode.js";
import TextNode from "../ast/TextNode.js";

export default class Optimizer {
    optimize(ast) {
        const optimizedRoot = new RootNode(this.mergeAdjacentTextNodes(ast.children));
        if (ast.dependencies) {
            optimizedRoot.dependencies = ast.dependencies;
        }
        return optimizedRoot;
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
