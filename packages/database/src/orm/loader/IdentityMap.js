export default class IdentityMap {
    #registry = new Map();

    static createKey(modelClassOrName, id) {
        let name = "Model";
        if (typeof modelClassOrName === "string") {
            name = modelClassOrName;
        } else if (typeof modelClassOrName === "function") {
            name = modelClassOrName.name;
        } else if (modelClassOrName && typeof modelClassOrName === "object") {
            const proto = Object.getPrototypeOf(modelClassOrName);
            const protoName = proto?.constructor?.name;
            name = (protoName && protoName !== "Object") ? protoName : (modelClassOrName.constructor?.name || "Model");
        }
        return `${name}:${String(id)}`;
    }

    get(modelClassOrName, id) {
        if (id === null || id === undefined) return null;
        const key = IdentityMap.createKey(modelClassOrName, id);
        return this.#registry.get(key) || null;
    }

    set(modelClassOrName, id, instance) {
        if (id === null || id === undefined || !instance) return instance;
        const key = IdentityMap.createKey(modelClassOrName, id);
        this.#registry.set(key, instance);
        return instance;
    }

    has(modelClassOrName, id) {
        if (id === null || id === undefined) return false;
        const key = IdentityMap.createKey(modelClassOrName, id);
        return this.#registry.has(key);
    }

    register(instance) {
        if (!instance || typeof instance.getAttribute !== "function") return instance;
        const modelClass = Object.getPrototypeOf(instance)?.constructor || instance.constructor;
        const pk = modelClass?.primaryKey || "id";
        const id = instance.getAttribute(pk);
        if (id !== null && id !== undefined) {
            return this.set(modelClass, id, instance);
        }
        return instance;
    }

    clear() {
        this.#registry.clear();
    }
}
