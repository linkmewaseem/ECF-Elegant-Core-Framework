import PluginRegistry from "./extensions/PluginRegistry.js";
import ModelEventBus from "./events/ModelEventBus.js";
import EventContext from "./events/EventContext.js";

export default class PluginManager {
    static #registries = new Map();

    static getRegistry(modelClass) {
        if (!this.#registries.has(modelClass)) {
            this.#registries.set(modelClass, new PluginRegistry(modelClass));
        }
        return this.#registries.get(modelClass);
    }

    static addListener(modelClass, event, callback) {
        ModelEventBus.on(modelClass, event, (ctx) => callback(ctx.model, ctx));
    }

    static register(modelClass, plugin, options = {}) {
        const registry = this.getRegistry(modelClass);
        registry.use(plugin, options);
    }

    static async boot(modelClass) {
        const registry = this.getRegistry(modelClass);
        await registry.bootAll();
    }

    static enablePlugin(modelClass, name, enable = true) {
        this.getRegistry(modelClass).enablePlugin(name, enable);
    }

    static disablePlugin(modelClass, name) {
        this.getRegistry(modelClass).disablePlugin(name);
    }

    static isPluginEnabled(modelClass, name) {
        return this.getRegistry(modelClass).isPluginEnabled(name);
    }

    static async uninstall(modelClass, name) {
        await this.getRegistry(modelClass).uninstall(name);
    }

    static plugins(modelClass) {
        return this.getRegistry(modelClass).plugins();
    }

    static capabilities(modelClass) {
        return this.getRegistry(modelClass).capabilities();
    }

    static async pluginDoctor(modelClass) {
        return await this.getRegistry(modelClass).pluginDoctor();
    }

    static pluginMetrics(modelClass, name) {
        return this.getRegistry(modelClass).pluginMetrics(name);
    }

    static extensionGraph(modelClass) {
        return this.getRegistry(modelClass).extensionGraph();
    }

    static async dispatch(modelInstance, event, payload = {}) {
        const modelClass = typeof modelInstance === "function"
            ? modelInstance
            : (modelInstance?.constructor || Object.getPrototypeOf(modelInstance)?.constructor);

        if (!modelClass) return true;

        const ctx = new EventContext({
            event,
            model: modelInstance,
            changes: payload.changes || {},
            original: payload.original || {}
        });
        Object.assign(ctx, payload);

        const registry = this.getRegistry(modelClass);
        const dispatcher = registry.getHookDispatcher();
        const hookRes = await dispatcher.dispatch(event, ctx);
        const busRes = await ModelEventBus.dispatch(ctx);

        return hookRes !== false && busRes !== false;
    }

    static dispatchSync(modelInstance, event, payload = {}) {
        const modelClass = typeof modelInstance === "function"
            ? modelInstance
            : (modelInstance?.constructor || Object.getPrototypeOf(modelInstance)?.constructor);

        if (!modelClass) return true;

        const ctx = new EventContext({
            event,
            model: modelInstance,
            changes: payload.changes || {},
            original: payload.original || {}
        });
        Object.assign(ctx, payload);

        const registry = this.getRegistry(modelClass);
        const dispatcher = registry.getHookDispatcher();
        const hookRes = dispatcher.dispatch(event, ctx);
        const busRes = ModelEventBus.dispatch(ctx);

        return hookRes !== false && busRes !== false;
    }
}
