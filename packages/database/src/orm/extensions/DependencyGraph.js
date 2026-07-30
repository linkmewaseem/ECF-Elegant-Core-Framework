export default class DependencyGraph {
    #nodes = new Map();
    #cache = null;

    addNode(name, dependencies = []) {
        this.#nodes.set(name, new Set(dependencies));
        this.invalidateCache();
    }

    removeNode(name) {
        this.#nodes.delete(name);
        for (const deps of this.#nodes.values()) {
            deps.delete(name);
        }
        this.invalidateCache();
    }

    invalidateCache() {
        this.#cache = null;
    }

    getSortedOrder() {
        if (this.#cache) {
            return [...this.#cache];
        }

        const sorted = [];
        const visited = new Set();
        const visiting = new Set();

        const visit = (nodeName) => {
            if (visiting.has(nodeName)) {
                throw new Error(`Circular dependency detected involving plugin '${nodeName}'.`);
            }
            if (!visited.has(nodeName)) {
                visiting.add(nodeName);
                const deps = this.#nodes.get(nodeName) || new Set();
                for (const dep of deps) {
                    if (this.#nodes.has(dep)) {
                        visit(dep);
                    }
                }
                visiting.delete(nodeName);
                visited.add(nodeName);
                sorted.push(nodeName);
            }
        };

        for (const nodeName of this.#nodes.keys()) {
            if (!visited.has(nodeName)) {
                visit(nodeName);
            }
        }

        this.#cache = sorted;
        return [...sorted];
    }

    getGraphRepresentation() {
        const repr = {};
        for (const [name, deps] of this.#nodes.entries()) {
            repr[name] = Array.from(deps);
        }
        return repr;
    }

    clear() {
        this.#nodes.clear();
        this.invalidateCache();
    }
}
