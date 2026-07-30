import CastManager from "./CastManager.js";
import Relation from "./relations/Relation.js";

export default class AttributeManager {
    #model;
    #attributes = {};
    #original = {};
    #changes = {};
    #relations = {};
    #relationCache = new Map();
    #cacheVersion = 0;
    #castManager;

    constructor(model, attributes = {}, force = false) {
        this.#model = model;
        this.#castManager = new CastManager(model);
        if (force) {
            this.forceFill(attributes);
        } else {
            this.fill(attributes);
        }
        this.syncOriginal();
    }

    get cacheVersion() {
        return this.#cacheVersion;
    }

    incrementCacheVersion() {
        this.#cacheVersion++;
        this.clearRelationCache();
        return this;
    }

    get castManager() {
        return this.#castManager;
    }

    get attributes() {
        return this.#attributes;
    }

    get original() {
        return this.#original;
    }

    get changes() {
        return this.#changes;
    }

    get relations() {
        return this.#relations;
    }

    hasAttribute(key) {
        return key in this.#attributes;
    }

    getAttribute(key, defaultValue = null) {
        if (!key) return null;

        // Custom getter check (e.g. getNameAttribute)
        const mutatorName = `get${key.charAt(0).toUpperCase()}${key.slice(1)}Attribute`;
        if (typeof this.#model[mutatorName] === "function") {
            return this.#model[mutatorName](this.#attributes[key]);
        }

        // Loaded relation check
        if (key in this.#relations) {
            return this.#relations[key];
        }

        // Relation cache check
        if (this.#relationCache.has(key)) {
            return this.#relationCache.get(key);
        }

        // Raw attribute check
        if (key in this.#attributes) {
            const rawValue = this.#attributes[key] !== undefined ? this.#attributes[key] : defaultValue;
            return this.#castManager.castGet(key, rawValue, this.#attributes);
        }

        // Dynamic relation method resolution (e.g. user.posts)
        if (typeof this.#model[key] === "function") {
            const rel = this.#model[key]();
            if (rel instanceof Relation) {
                rel.relationName = key;
                return rel;
            }
        }

        return defaultValue;
    }

    setAttribute(key, value) {
        if (!key) return this;

        let finalVal = this.#castManager.castSet(key, value, this.#attributes);

        const mutatorName = `set${key.charAt(0).toUpperCase()}${key.slice(1)}Attribute`;
        if (typeof this.#model[mutatorName] === "function") {
            const mutated = this.#model[mutatorName](finalVal);
            if (mutated !== undefined) {
                finalVal = mutated;
            } else if (this.#attributes[key] !== undefined) {
                finalVal = this.#attributes[key];
            }
        }

        const oldVal = this.#attributes[key];
        this.#attributes[key] = finalVal;

        if (oldVal !== finalVal) {
            this.#changes[key] = finalVal;
        }

        return this;
    }

    fill(attributes = {}) {
        if (!attributes || typeof attributes !== "object") return this;

        const modelClass = this.#model.constructor;
        const fillable = modelClass.fillable || [];
        const guarded = modelClass.guarded || [];

        for (const [key, value] of Object.entries(attributes)) {
            if (this.isFillable(key, fillable, guarded)) {
                this.setAttribute(key, value);
            }
        }

        return this;
    }

    forceFill(attributes = {}) {
        if (!attributes || typeof attributes !== "object") return this;

        for (const [key, value] of Object.entries(attributes)) {
            this.setAttribute(key, value);
        }

        return this;
    }

    isFillable(key, fillable = [], guarded = []) {
        if (Array.isArray(fillable) && fillable.length > 0) {
            return fillable.includes(key);
        }
        if (Array.isArray(guarded) && guarded.includes("*")) {
            return false;
        }
        if (Array.isArray(guarded)) {
            return !guarded.includes(key);
        }
        return true;
    }

    isDirty(key = null) {
        if (key) {
            return this.#attributes[key] !== this.#original[key];
        }
        for (const k of Object.keys(this.#attributes)) {
            if (this.#attributes[k] !== this.#original[k]) return true;
        }
        return false;
    }

    isClean(key = null) {
        return !this.isDirty(key);
    }

    getOriginal(key = null, defaultValue = null) {
        if (key) {
            return this.#original[key] !== undefined ? this.#original[key] : defaultValue;
        }
        return { ...this.#original };
    }

    getChanges() {
        const changes = {};
        for (const key of Object.keys(this.#attributes)) {
            if (this.#attributes[key] !== this.#original[key]) {
                changes[key] = this.#attributes[key];
            }
        }
        return changes;
    }

    getRawAttributes() {
        return { ...this.#attributes };
    }

    syncOriginal() {
        this.#original = { ...this.#attributes };
        this.#changes = {};
        return this;
    }

    setRelation(key, value) {
        this.#relations[key] = value;
        this.#relationCache.set(key, value);
        return this;
    }

    getRelation(key, defaultValue = null) {
        if (key in this.#relations) {
            return this.#relations[key];
        }
        if (this.#relationCache.has(key)) {
            return this.#relationCache.get(key);
        }
        return defaultValue;
    }

    hasRelation(key) {
        return key in this.#relations || this.#relationCache.has(key);
    }

    clearRelationCache() {
        this.#relations = {};
        this.#relationCache.clear();
        return this;
    }

    unloadRelation(key) {
        delete this.#relations[key];
        this.#relationCache.delete(key);
        return this;
    }

    toObject() {
        const modelClass = this.#model.constructor;
        const visible = modelClass.visible;
        const hidden = modelClass.hidden;
        const appends = modelClass.appends;

        let obj = {};

        // Raw attributes cast to public representation
        for (const key of Object.keys(this.#attributes)) {
            obj[key] = this.getAttribute(key);
        }

        // Loaded relations
        for (const key of Object.keys(this.#relations)) {
            const relVal = this.#relations[key];
            if (relVal && typeof relVal.toJSON === "function") {
                obj[key] = relVal.toJSON();
            } else {
                obj[key] = relVal;
            }
        }

        // Appends (virtual attributes via getters)
        if (Array.isArray(appends)) {
            for (const key of appends) {
                obj[key] = this.#model.getAttribute(key);
            }
        }

        // Visible filtering
        if (Array.isArray(visible) && visible.length > 0) {
            const filtered = {};
            for (const key of visible) {
                if (key in obj) {
                    filtered[key] = obj[key];
                }
            }
            obj = filtered;
        }

        // Hidden exclusion
        if (Array.isArray(hidden) && hidden.length > 0) {
            for (const key of hidden) {
                delete obj[key];
            }
        }

        return obj;
    }
}
