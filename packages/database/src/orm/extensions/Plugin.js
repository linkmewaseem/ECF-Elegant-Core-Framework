import PluginManifest from "./PluginManifest.js";

export default class Plugin {
    manifest;

    constructor(manifestConfig = {}) {
        this.manifest = PluginManifest.parse(manifestConfig);
    }

    async register(context) {
        // Stage 1: Register container singletons / bindings
    }

    async boot(context) {
        // Stage 2: Boot model scopes, hooks, event listeners
    }

    async ready(context) {
        // Stage 3: Invoked when all dependent plugins are booted
    }

    async shutdown(context) {
        // Stage 4: Cleanup listeners and state on reload or uninstall
    }

    async health(context) {
        return {
            healthy: true,
            message: `Plugin ${this.manifest.name} operating normally.`
        };
    }
}
