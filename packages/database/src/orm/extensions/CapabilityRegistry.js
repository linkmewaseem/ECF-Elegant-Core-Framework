import { PluginCapabilityException } from "./PluginException.js";

export default class CapabilityRegistry {
    #capabilities = new Map();

    registerCapabilities(pluginName, provides = {}) {
        for (const [capName, capDef] of Object.entries(provides)) {
            const version = typeof capDef === "string" ? capDef : (capDef.version || "1.0.0");
            const methods = Array.isArray(capDef.methods) ? capDef.methods : [];
            const contract = capDef.contract || null;

            this.#capabilities.set(capName, {
                provider: pluginName,
                version,
                methods,
                contract
            });
        }
    }

    unregisterCapabilities(pluginName) {
        for (const [capName, capData] of this.#capabilities.entries()) {
            if (capData.provider === pluginName) {
                this.#capabilities.delete(capName);
            }
        }
    }

    validateRequirements(pluginName, requires = {}) {
        for (const [capName, reqVersion] of Object.entries(requires)) {
            if (!this.#capabilities.has(capName)) {
                throw new PluginCapabilityException(
                    `Plugin '${pluginName}' requires capability '${capName}' (${reqVersion}), but no active plugin provides it.`
                );
            }

            const cap = this.#capabilities.get(capName);

            if (reqVersion !== "*" && reqVersion !== ">=1.0.0" && cap.version !== reqVersion) {
                if (reqVersion.startsWith(">=") && cap.version < reqVersion.slice(2)) {
                    throw new PluginCapabilityException(
                        `Plugin '${pluginName}' requires capability '${capName}' version '${reqVersion}', but provider '${cap.provider}' offers version '${cap.version}'.`
                    );
                }
            }
        }
    }

    getCapability(capName) {
        if (!this.#capabilities.has(capName)) {
            throw new PluginCapabilityException(`Capability '${capName}' is not registered by any active plugin.`);
        }
        return this.#capabilities.get(capName);
    }

    hasCapability(capName) {
        return this.#capabilities.has(capName);
    }

    getAllCapabilities() {
        const result = {};
        for (const [name, data] of this.#capabilities.entries()) {
            result[name] = { ...data };
        }
        return result;
    }

    clear() {
        this.#capabilities.clear();
    }
}
