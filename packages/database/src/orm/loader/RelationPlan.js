export class RelationPlanNode {
    name;
    constraint;
    children = new Map();

    constructor(name, constraint = null) {
        this.name = name;
        this.constraint = constraint;
    }

    addChild(childNode) {
        this.children.set(childNode.name, childNode);
        return childNode;
    }

    getChild(name) {
        return this.children.get(name) || null;
    }

    freeze() {
        Object.freeze(this);
        for (const child of this.children.values()) {
            if (typeof child.freeze === "function") {
                child.freeze();
            }
        }
        return this;
    }
}

export default class RelationPlan {
    static compile(relations = [], modelClass = null) {
        const root = new RelationPlanNode("root");
        const specs = Array.isArray(relations) ? relations.flat(Infinity) : [relations];

        for (const spec of specs) {
            if (typeof spec === "string") {
                RelationPlan.addPath(root, spec, null);
            } else if (typeof spec === "object" && spec !== null) {
                for (const [path, constraint] of Object.entries(spec)) {
                    RelationPlan.addPath(root, path, constraint);
                }
            }
        }

        return root.freeze();
    }

    static addPath(rootNode, path, constraint = null) {
        const segments = path.split(".");
        const visited = new Set();
        let current = rootNode;

        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i].trim();
            if (!seg) continue;

            // Circular relation detection
            if (visited.has(seg) && i > 0 && segments[i - 1] === seg) {
                console.warn(`[RelationPlan] Circular relation loop detected in path '${path}'. Truncating at '${seg}'.`);
                break;
            }
            visited.add(seg);

            let child = current.getChild(seg);
            const isLast = i === segments.length - 1;
            const segmentConstraint = isLast ? constraint : null;

            if (!child) {
                child = new RelationPlanNode(seg, segmentConstraint);
                current.addChild(child);
            } else if (isLast && constraint) {
                child.constraint = constraint;
            }

            current = child;
        }
    }
}
