import PluginStorage from "./PluginStorage.js";

export default class PluginContext {
    constructor({
        model,
        query = null,
        events = null,
        container = null,
        config = {},
        logger = console,
        metrics = null,
        options = {},
        pluginsMap = new Map(),
        capabilityRegistry = null
    }) {
        const storage = new PluginStorage();

        const contextTarget = {
            model,
            query,
            events,
            container,
            config: Object.freeze({ ...config }),
            logger,
            metrics,
            storage,
            options: Object.freeze({ ...options }),
            plugins: Object.freeze(new Map(pluginsMap)),
            capabilities: capabilityRegistry,
            use: (capName) => {
                if (!capabilityRegistry) return null;
                const cap = capabilityRegistry.getCapability(capName);
                const providerEntry = pluginsMap.get(cap.provider);
                return providerEntry ? providerEntry.instance : null;
            }
        };

        // Wrap in read-only Proxy to ensure context immutability
        return new Proxy(contextTarget, {
            get(target, prop, receiver) {
                if (prop in target) {
                    return Reflect.get(target, prop, receiver);
                }
                return undefined;
            },
            set(target, prop) {
                if (["storage"].includes(prop)) {
                    return true;
                }
                throw new Error(`Cannot mutate read-only PluginContext property '${String(prop)}'.`);
            },
            deleteProperty() {
                throw new Error("Cannot delete properties on read-only PluginContext.");
            }
        });
    }
}
