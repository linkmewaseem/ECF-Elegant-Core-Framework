import ConfigError from "./errors/ConfigError.js";
export default class ConfigManager {
    constructor() {
        this.items = {};
    }

set(path, value) {
    this.validatePath(path);

    const keys = path.split(".");
    let current = this.items;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

        if (
            current[key] === undefined ||
            current[key] === null ||
            typeof current[key] !== "object"
        ) {
            current[key] = {};
        }

        current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;

    return this;
}

validatePath(path) {
    if (typeof path !== "string" || path.trim() === "") {
        throw new ConfigError("Config path must be a non-empty string.");
    }
}

    get(path, defaultValue = null) {
        this.validatePath(path);

        const keys = path.split(".");
        let current = this.items;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];

            if (
                current[key] === undefined ||
                current[key] === null ||
                typeof current[key] !== "object"
            ) {
                return defaultValue;
            }

            current = current[key];
        }

        const lastKey = keys[keys.length - 1];

        return current[lastKey] !== undefined ? current[lastKey] : defaultValue;
    }

    load(namespace, configObject) {
        if (typeof namespace !== "string" || !namespace.trim()) {
            throw new ConfigError("Config namespace must be a non-empty string.");
        }
        if (typeof configObject !== "object" || configObject === null) {
            return this;
        }

        this.items[namespace] = {
            ...(this.items[namespace] || {}),
            ...configObject,
        };

        return this;
    }

    loadMany(configMap) {
        if (typeof configMap !== "object" || configMap === null) {
            return this;
        }

        for (const [namespace, configObject] of Object.entries(configMap)) {
            this.load(namespace, configObject);
        }

        return this;
    }
}