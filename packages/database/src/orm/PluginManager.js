export default class PluginManager {
    static #plugins = new Map();
    static #listeners = new Map();

    static register(modelClass, plugin, options = {}) {
        if (!this.#plugins.has(modelClass)) {
            this.#plugins.set(modelClass, []);
        }
        this.#plugins.get(modelClass).push({ plugin, options });

        if (typeof plugin === "function") {
            plugin(modelClass, options);
        } else if (plugin && typeof plugin.boot === "function") {
            plugin.boot(modelClass, options);
        }
    }

    static addListener(modelClass, event, callback) {
        const key = `${modelClass.name}:${event}`;
        if (!this.#listeners.has(key)) {
            this.#listeners.set(key, []);
        }
        this.#listeners.get(key).push(callback);
    }

    static async dispatch(modelInstance, event, payload = {}) {
        const modelClass = typeof modelInstance === "function"
            ? modelInstance
            : (modelInstance?.constructor || Object.getPrototypeOf(modelInstance)?.constructor);
        const key = modelClass ? `${modelClass.name}:${event}` : event;

        // Model instance inline hook (e.g. user.onCreating())
        const hookMethod = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
        if (typeof modelInstance[hookMethod] === "function") {
            await modelInstance[hookMethod](payload);
        }

        const listeners = this.#listeners.get(key) || [];
        for (const listener of listeners) {
            await listener(modelInstance, payload);
        }
    }

    static dispatchSync(modelInstance, event, payload = {}) {
        const modelClass = typeof modelInstance === "function"
            ? modelInstance
            : (modelInstance?.constructor || Object.getPrototypeOf(modelInstance)?.constructor);
        const key = modelClass ? `${modelClass.name}:${event}` : event;

        const hookMethod = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
        if (modelInstance && typeof modelInstance[hookMethod] === "function") {
            modelInstance[hookMethod](payload);
        }

        const listeners = this.#listeners.get(key) || [];
        for (const listener of listeners) {
            listener(modelInstance, payload);
        }
    }
}
