import DependencyGraph from "./DependencyGraph.js";
import { PluginDependencyException } from "./PluginException.js";

export default class PluginResolver {
    #graph = new DependencyGraph();

    resolveBootOrder(pluginEntries, capabilityRegistry) {
        this.#graph.clear();

        const nameToEntry = new Map();
        for (const entry of pluginEntries) {
            nameToEntry.set(entry.manifest.name, entry);

            const deps = [];
            if (Array.isArray(entry.manifest.dependencies)) {
                deps.push(...entry.manifest.dependencies);
            }
            this.#graph.addNode(entry.manifest.name, deps);
        }

        // Check required dependencies presence
        for (const entry of pluginEntries) {
            const pluginName = entry.manifest.name;
            const deps = entry.manifest.dependencies || [];
            for (const depName of deps) {
                if (!nameToEntry.has(depName)) {
                    throw new PluginDependencyException(
                        `Plugin '${pluginName}' depends on plugin '${depName}', but '${depName}' is not installed.`
                    );
                }
            }

            // Validate capabilities required
            if (capabilityRegistry) {
                capabilityRegistry.validateRequirements(pluginName, entry.manifest.requires);
            }
        }

        const sortedNames = this.#graph.getSortedOrder();
        const sortedEntries = sortedNames.map(name => nameToEntry.get(name)).filter(Boolean);

        // Sub-sort by priorityGroup and priority
        const groupOrder = { EARLY: 1, NORMAL: 2, LATE: 3 };
        sortedEntries.sort((a, b) => {
            const gDiff = groupOrder[a.manifest.priorityGroup] - groupOrder[b.manifest.priorityGroup];
            if (gDiff !== 0) return gDiff;
            return a.manifest.priority - b.manifest.priority;
        });

        return sortedEntries;
    }

    getGraph() {
        return this.#graph.getGraphRepresentation();
    }
}
