import PluginTypes from "./PluginTypes.js";
import { PluginException } from "./PluginException.js";

export default class PluginManifest {
    constructor(rawManifest = {}) {
        const name = rawManifest.name || "anonymous-plugin";
        this.id = rawManifest.id || Symbol(`ecf:plugin:${name}`);
        this.name = name;
        this.version = rawManifest.version || "1.0.0";
        this.apiVersion = rawManifest.apiVersion || "1";
        this.framework = rawManifest.framework || "^1.0.0";
        this.type = rawManifest.type || PluginTypes.ORM;
        this.priorityGroup = (rawManifest.priorityGroup || "NORMAL").toUpperCase();
        this.priority = typeof rawManifest.priority === "number" ? rawManifest.priority : 10;
        this.author = rawManifest.author || "";
        this.license = rawManifest.license || "MIT";
        this.homepage = rawManifest.homepage || "";
        this.repository = rawManifest.repository || "";
        this.description = rawManifest.description || "";
        this.keywords = Array.isArray(rawManifest.keywords) ? rawManifest.keywords : [];
        this.requires = rawManifest.requires || {};
        this.provides = rawManifest.provides || {};

        this.validate();
    }

    validate() {
        if (!["EARLY", "NORMAL", "LATE"].includes(this.priorityGroup)) {
            throw new PluginException(`Invalid priority group '${this.priorityGroup}' in plugin '${this.name}'. Must be EARLY, NORMAL, or LATE.`);
        }
    }

    static parse(plugin) {
        if (!plugin) {
            throw new PluginException("Cannot parse manifest from undefined or null plugin");
        }
        if (typeof plugin === "function") {
            return new PluginManifest({
                name: plugin.name || "AnonymousFunctionPlugin"
            });
        }
        const manifestData = plugin.manifest || plugin.constructor?.manifest || plugin;
        return new PluginManifest(manifestData);
    }
}
