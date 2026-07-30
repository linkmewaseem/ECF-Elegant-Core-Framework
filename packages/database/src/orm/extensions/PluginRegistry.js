import PluginResolver from "./PluginResolver.js";
import CapabilityRegistry from "./CapabilityRegistry.js";
import HookDispatcher from "./HookDispatcher.js";
import MetricsCollector from "./MetricsCollector.js";
import PluginContext from "./PluginContext.js";
import PluginManifest from "./PluginManifest.js";
import ModelEventBus from "../events/ModelEventBus.js";

export default class PluginRegistry {
    #entries = new Map();
    #resolver = new PluginResolver();
    #capabilities = new CapabilityRegistry();
    #hooks = new HookDispatcher();
    #metrics = new MetricsCollector();
    #modelClass = null;

    constructor(modelClass) {
        this.#modelClass = modelClass;
    }

    use(plugin, options = {}) {
        let instance = plugin;
        if (typeof plugin === "function") {
            if (plugin.prototype && typeof plugin.prototype.boot === "function") {
                instance = new plugin(options);
            } else {
                instance = {
                    manifest: PluginManifest.parse(plugin),
                    boot: (ctx) => plugin(ctx.model, ctx.options)
                };
            }
        }

        const manifest = PluginManifest.parse(instance.manifest || instance);
        const name = manifest.name;

        const entry = {
            id: manifest.id,
            name,
            manifest,
            instance,
            options,
            enabled: true,
            status: "installed", // installed, booted, unhealthy, disabled
            error: null,
            context: null
        };

        this.#entries.set(name, entry);
        this.#capabilities.registerCapabilities(name, manifest.provides);

        // Boot plugin synchronously upon registration
        this.bootEntry(entry);
        return this;
    }

    bootEntry(entry) {
        if (!entry.enabled || entry.status === "booted") return;
        entry.context = this.createContext(entry);

        const startTime = performance.now();
        try {
            if (typeof entry.instance.register === "function") {
                const regRes = entry.instance.register(entry.context);
                if (regRes && typeof regRes.catch === "function") {
                    regRes.catch(err => this.handleRecovery(entry, err, "register"));
                }
            }
            if (typeof entry.instance.boot === "function") {
                const bootRes = entry.instance.boot(entry.context);
                if (bootRes && typeof bootRes.catch === "function") {
                    bootRes.catch(err => this.handleRecovery(entry, err, "boot"));
                }
            }
            if (entry.status !== "unhealthy") {
                entry.status = "booted";
            }
        } catch (err) {
            this.handleRecovery(entry, err, "boot");
        }
        this.#metrics.recordCall(entry.name, performance.now() - startTime, entry.status !== "unhealthy");
    }

    async bootAll() {
        const entriesList = Array.from(this.#entries.values());
        const sortedEntries = this.#resolver.resolveBootOrder(entriesList, this.#capabilities);

        // Stage 1: register()
        for (const entry of sortedEntries) {
            if (!entry.enabled || entry.status === "booted") continue;
            entry.context = this.createContext(entry);
            const startTime = performance.now();
            try {
                if (typeof entry.instance.register === "function") {
                    entry.instance.register(entry.context);
                }
            } catch (err) {
                this.handleRecovery(entry, err, "register");
            }
            this.#metrics.recordCall(entry.name, performance.now() - startTime, entry.status !== "unhealthy");
        }

        // Stage 2: boot()
        for (const entry of sortedEntries) {
            if (!entry.enabled || entry.status === "booted" || entry.status === "unhealthy") continue;
            const startTime = performance.now();
            try {
                if (typeof entry.instance.boot === "function") {
                    entry.instance.boot(entry.context);
                }
                entry.status = "booted";
            } catch (err) {
                this.handleRecovery(entry, err, "boot");
            }
            this.#metrics.recordCall(entry.name, performance.now() - startTime, entry.status !== "unhealthy");
        }

        // Stage 3: ready()
        for (const entry of sortedEntries) {
            if (!entry.enabled || entry.status !== "booted") continue;
            const startTime = performance.now();
            try {
                if (typeof entry.instance.ready === "function") {
                    await entry.instance.ready(entry.context);
                }
            } catch (err) {
                this.handleRecovery(entry, err, "ready");
            }
            this.#metrics.recordCall(entry.name, performance.now() - startTime, entry.status !== "unhealthy");
        }
    }

    handleRecovery(entry, error, stage) {
        entry.status = "unhealthy";
        entry.enabled = false;
        entry.error = error;
        this.#hooks.unregisterPluginHooks(entry.name);
        this.#capabilities.unregisterCapabilities(entry.name);
        console.error(`[ECF Plugin Recovery] Plugin '${entry.name}' failed during '${stage}':`, error.message);
    }

    createContext(entry) {
        const pluginsMap = new Map();
        for (const [name, e] of this.#entries.entries()) {
            pluginsMap.set(name, e);
        }

        return new PluginContext({
            model: this.#modelClass,
            events: ModelEventBus,
            options: entry.options,
            metrics: this.#metrics,
            pluginsMap,
            capabilityRegistry: this.#capabilities
        });
    }

    enablePlugin(name, enable = true) {
        const entry = this.#entries.get(name);
        if (entry) {
            entry.enabled = Boolean(enable);
            if (!enable && entry.status === "booted") {
                entry.status = "disabled";
                this.#hooks.unregisterPluginHooks(name);
            }
        }
    }

    disablePlugin(name) {
        this.enablePlugin(name, false);
    }

    isPluginEnabled(name) {
        const entry = this.#entries.get(name);
        return Boolean(entry && entry.enabled);
    }

    async uninstall(name) {
        const entry = this.#entries.get(name);
        if (entry) {
            if (entry.context && typeof entry.instance.shutdown === "function") {
                try {
                    await entry.instance.shutdown(entry.context);
                } catch (err) {
                    // Ignore shutdown errors
                }
            }
            this.#hooks.unregisterPluginHooks(name);
            this.#capabilities.unregisterCapabilities(name);
            this.#entries.delete(name);
        }
    }

    plugins() {
        return Array.from(this.#entries.values()).map(e => ({
            id: String(e.id),
            name: e.name,
            version: e.manifest.version,
            type: e.manifest.type,
            enabled: e.enabled,
            status: e.status,
            priorityGroup: e.manifest.priorityGroup,
            priority: e.manifest.priority
        }));
    }

    capabilities() {
        return this.#capabilities.getAllCapabilities();
    }

    async pluginDoctor() {
        const report = [];
        for (const entry of this.#entries.values()) {
            if (!entry.enabled) {
                report.push({
                    name: entry.name,
                    healthy: false,
                    status: entry.status,
                    message: entry.error ? entry.error.message : "Plugin disabled"
                });
                continue;
            }

            try {
                const healthRes = typeof entry.instance.health === "function"
                    ? await entry.instance.health(entry.context)
                    : { healthy: true, message: "Healthy" };

                report.push({
                    name: entry.name,
                    healthy: healthRes.healthy,
                    status: entry.status,
                    message: healthRes.message
                });
            } catch (err) {
                report.push({
                    name: entry.name,
                    healthy: false,
                    status: "unhealthy",
                    message: err.message
                });
            }
        }

        return report;
    }

    pluginMetrics(name) {
        return this.#metrics.getMetrics(name);
    }

    extensionGraph() {
        return this.#resolver.getGraph();
    }

    getHookDispatcher() {
        return this.#hooks;
    }
}
