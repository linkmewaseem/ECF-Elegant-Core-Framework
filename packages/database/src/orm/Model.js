import AttributeManager from "./AttributeManager.js";
import ModelRepository from "./ModelRepository.js";
import PluginManager from "./PluginManager.js";
import HasOne from "./relations/HasOne.js";
import HasMany from "./relations/HasMany.js";
import BelongsTo from "./relations/BelongsTo.js";
import BelongsToMany from "./relations/BelongsToMany.js";
import RelationLoader from "./loader/RelationLoader.js";
import AggregateLoader from "./loader/AggregateLoader.js";
import ModelCollection from "./ModelCollection.js";
import ModelEventBus from "./events/ModelEventBus.js";

function createCallableRelationProxy(fn, getCollection) {
    return new Proxy(fn, {
        apply(target, thisArg, argArray) {
            return target(...argArray);
        },
        get(target, prop, receiver) {
            if (prop === Symbol.iterator) {
                const col = getCollection();
                return col ? col[Symbol.iterator].bind(col) : undefined;
            }
            if (typeof prop === "string" && !isNaN(prop)) {
                const col = getCollection();
                return col ? col[prop] : undefined;
            }
            const col = getCollection();
            if (col && (prop in col || typeof col[prop] !== "undefined")) {
                const val = col[prop];
                return typeof val === "function" ? val.bind(col) : val;
            }
            return Reflect.get(target, prop, receiver);
        }
    });
}

export default class Model {
    static table = null;
    static connection = null;
    static primaryKey = "id";
    static keyType = "integer";
    static incrementing = true;
    static fillable = [];
    static guarded = [];
    static casts = {};
    static hidden = [];
    static visible = [];
    static appends = [];
    static profiles = {};

    #attributeManager;
    _exists = false;

    constructor(attributes = {}, force = false) {
        this.#attributeManager = new AttributeManager(this, attributes, force);

        // Wrap instance in ES6 Proxy for seamless property access & mutation
        return new Proxy(this, {
            get(target, prop, receiver) {
                if (prop === "exists" || prop === "_exists") {
                    return target._exists ?? false;
                }

                if (typeof prop === "symbol" || prop.startsWith("#")) {
                    return Reflect.get(target, prop);
                }

                const mgr = target.getAttributeManager();

                // 1. Prototype relation method dual callable / property resolution
                if (prop in target && typeof target[prop] === "function" && !(prop in Model.prototype)) {
                    const fn = target[prop].bind(target);
                    if (mgr && mgr.hasRelation(prop)) {
                        const relVal = mgr.getAttribute(prop);
                        if (relVal instanceof ModelCollection) {
                            return createCallableRelationProxy(fn, () => mgr.getAttribute(prop));
                        }
                        return relVal;
                    }
                    return createCallableRelationProxy(fn, () => mgr.getAttribute(prop));
                }

                // 2. Base Model methods, properties & constructor
                if (prop in target) {
                    if (prop === "constructor") {
                        return target.constructor;
                    }
                    const val = Reflect.get(target, prop);
                    if (typeof val === "function") {
                        return val.bind(target);
                    }
                    return val;
                }

                // 3. Loaded relation precedence for non-method properties
                if (mgr && mgr.hasRelation(prop)) {
                    return mgr.getAttribute(prop);
                }

                // 4. Direct raw attribute precedence
                if (mgr && mgr.hasAttribute(prop)) {
                    return target.getAttribute(prop);
                }

                // 5. Default fallback to getAttribute (accessors, virtual appends)
                return target.getAttribute(prop);
            },
            set(target, prop, value, receiver) {
                if (prop === "exists" || prop === "_exists") {
                    target._exists = Boolean(value);
                    return true;
                }

                if (prop in target && typeof target[prop] !== "function") {
                    return Reflect.set(target, prop, value, receiver);
                }
                target.setAttribute(prop, value);
                return true;
            }
        });
    }

    getAttributeManager() {
        return this.#attributeManager;
    }

    getAttribute(key, defaultValue = null) {
        return this.#attributeManager.getAttribute(key, defaultValue);
    }

    setAttribute(key, value) {
        this.#attributeManager.setAttribute(key, value);
        return this;
    }

    fill(attributes) {
        this.#attributeManager.fill(attributes);
        return this;
    }

    forceFill(attributes) {
        this.#attributeManager.forceFill(attributes);
        return this;
    }

    isDirty(key = null) {
        return this.#attributeManager.isDirty(key);
    }

    isClean(key = null) {
        return !this.isDirty(key);
    }

    getOriginal(key = null, defaultValue = null) {
        return this.#attributeManager.getOriginal(key, defaultValue);
    }

    getChanges() {
        return this.#attributeManager.getChanges();
    }

    async save() {
        return this.constructor.repository().save(this);
    }

    async delete() {
        return this.constructor.repository().delete(this);
    }

    async refresh() {
        this.#attributeManager.clearRelationCache();

        const pk = this.constructor.primaryKey || "id";
        const id = this.getAttribute(pk);

        if (id) {
            const reloaded = await this.constructor.find(id);
            if (reloaded) {
                this.forceFill(reloaded.getAttributeManager().getRawAttributes());
                this.#attributeManager.syncOriginal();
            }
        }

        return this;
    }

    // Relation Load State & Lazy Loading

    isRelationLoaded(relationName) {
        return this.#attributeManager.hasRelation(relationName);
    }

    unloadRelation(relationName) {
        this.#attributeManager.unloadRelation(relationName);
        return this;
    }

    async load(...relations) {
        await RelationLoader.load(this, relations);
        return this;
    }

    async reload(...relations) {
        if (relations.length > 0) {
            for (const rel of relations) {
                this.unloadRelation(rel);
            }
            await RelationLoader.load(this, relations);
        } else {
            await this.refresh();
        }
        return this;
    }

    async loadCount(...relations) {
        for (const rel of relations.flat()) {
            await AggregateLoader.loadCount([this], rel);
        }
        return this;
    }

    async loadExists(...relations) {
        for (const rel of relations.flat()) {
            await AggregateLoader.loadExists([this], rel);
        }
        return this;
    }

    toJSON() {
        return this.#attributeManager.toObject();
    }

    toArray() {
        return this.toJSON();
    }

    // Relationship Definitions

    hasOne(relatedClass, foreignKey = null, localKey = null) {
        return new HasOne(this, relatedClass, foreignKey, localKey);
    }

    hasMany(relatedClass, foreignKey = null, localKey = null) {
        return new HasMany(this, relatedClass, foreignKey, localKey);
    }

    belongsTo(relatedClass, foreignKey = null, ownerKey = null) {
        return new BelongsTo(this, relatedClass, foreignKey, ownerKey);
    }

    belongsToMany(
        relatedClass,
        table = null,
        foreignPivotKey = null,
        relatedPivotKey = null,
        parentKey = null,
        relatedKey = null
    ) {
        return new BelongsToMany(
            this,
            relatedClass,
            table,
            foreignPivotKey,
            relatedPivotKey,
            parentKey,
            relatedKey
        );
    }

    // Boot & Scope System Engine

    static #bootedMap = new Map();
    static meta = { scopes: new Map(), globalScopes: [] };

    static bootIfNeeded() {
        if (Model.#bootedMap.has(this)) {
            return;
        }
        Model.#bootedMap.set(this, true);

        // Subclass meta isolation: ensure subclass has its own meta object
        const parentClass = Object.getPrototypeOf(this);
        const parentGlobalScopes = (parentClass && parentClass.meta && parentClass.meta.globalScopes)
            ? [...parentClass.meta.globalScopes]
            : [];

        this.meta = {
            scopes: new Map(),
            globalScopes: parentGlobalScopes
        };

        // Scan static scope methods on class constructor
        const staticProps = Object.getOwnPropertyNames(this);
        for (const prop of staticProps) {
            if (prop.startsWith("scope") && prop.length > 5 && typeof this[prop] === "function") {
                const scopeName = prop.slice(5, 6).toLowerCase() + prop.slice(6);
                this.meta.scopes.set(scopeName, this[prop].bind(this));
                if (!(scopeName in this)) {
                    this[scopeName] = function(...args) {
                        return this.query()[scopeName](...args);
                    };
                }
            }
        }

        // Scan instance scope methods on prototype
        if (this.prototype) {
            const protoProps = Object.getOwnPropertyNames(this.prototype);
            for (const prop of protoProps) {
                if (prop.startsWith("scope") && prop.length > 5 && typeof this.prototype[prop] === "function") {
                    const scopeName = prop.slice(5, 6).toLowerCase() + prop.slice(6);
                    this.meta.scopes.set(scopeName, this.prototype[prop]);
                    if (!(scopeName in this)) {
                        this[scopeName] = function(...args) {
                            return this.query()[scopeName](...args);
                        };
                    }
                }
            }
        }

        this.boot();
        PluginManager.boot(this);
    }

    static boot() {
        // Lifecycle boot hook for subclasses
    }

    static addGlobalScope(scope, optionsOrPriority = null) {
        this.bootIfNeeded();

        let scopeObj = null;

        if (typeof scope === "string") {
            const applyFn = typeof optionsOrPriority === "function" ? optionsOrPriority : optionsOrPriority?.apply;
            const priority = typeof optionsOrPriority === "number"
                ? optionsOrPriority
                : (optionsOrPriority?.priority ?? 10);
            const when = optionsOrPriority?.when ?? null;
            const remove = optionsOrPriority?.remove ?? null;

            scopeObj = {
                name: scope,
                apply: applyFn,
                remove,
                priority,
                when
            };
        } else if (typeof scope === "function") {
            const name = scope.name && scope.name !== "apply" && scope.name !== "scope" 
                ? scope.name 
                : `scope_${this.meta.globalScopes.length + 1}`;
            const priority = typeof optionsOrPriority === "number"
                ? optionsOrPriority
                : (optionsOrPriority?.priority ?? 10);
            const when = optionsOrPriority?.when ?? null;

            scopeObj = {
                name,
                apply: scope,
                remove: null,
                priority,
                when
            };
        } else if (typeof scope === "object" && scope !== null) {
            const name = scope.name || `scope_${this.meta.globalScopes.length + 1}`;
            const priority = scope.priority ?? (typeof optionsOrPriority === "number" ? optionsOrPriority : optionsOrPriority?.priority ?? 10);
            const when = scope.when || optionsOrPriority?.when || null;
            const remove = scope.remove || optionsOrPriority?.remove || null;

            scopeObj = {
                name,
                apply: scope.apply ? scope.apply.bind(scope) : null,
                remove: remove ? remove.bind(scope) : null,
                priority,
                when
            };
        }

        if (scopeObj) {
            const existingIdx = this.meta.globalScopes.findIndex(s => s.name === scopeObj.name);
            if (existingIdx !== -1) {
                this.meta.globalScopes[existingIdx] = scopeObj;
            } else {
                this.meta.globalScopes.push(scopeObj);
            }
        }

        return this;
    }

    static getGlobalScopes() {
        this.bootIfNeeded();
        return this.meta.globalScopes || [];
    }

    static withoutGlobalScope(name) {
        return this.query().withoutGlobalScope(name);
    }

    static withoutGlobalScopes(names = null) {
        return this.query().withoutGlobalScopes(names);
    }

    // Static API Delegators

    static repository() {
        this.bootIfNeeded();
        return new ModelRepository(this);
    }

    static query() {
        this.bootIfNeeded();
        return this.repository().query();
    }

    static where(field, operator, value) {
        return this.repository().where(field, operator, value);
    }

    static with(...relations) {
        return this.repository().with(...relations);
    }

    static withCount(...relations) {
        return this.repository().withCount(...relations);
    }

    static withExists(...relations) {
        return this.repository().withExists(...relations);
    }

    static withSum(relation, column, alias = null) {
        return this.repository().withSum(relation, column, alias);
    }

    static withAvg(relation, column, alias = null) {
        return this.repository().withAvg(relation, column, alias);
    }

    static withMin(relation, column, alias = null) {
        return this.repository().withMin(relation, column, alias);
    }

    static withMax(relation, column, alias = null) {
        return this.repository().withMax(relation, column, alias);
    }

    static profile(...profileNames) {
        return this.repository().profile(...profileNames);
    }

    static async all() {
        return this.repository().all();
    }

    static async find(id) {
        return this.repository().find(id);
    }

    static async findOrFail(id) {
        return this.repository().findOrFail(id);
    }

    static make(attributes = {}) {
        return new this(attributes);
    }

    static async create(attributes = {}) {
        return this.repository().create(attributes);
    }

    static use(plugin, options = {}) {
        PluginManager.register(this, plugin, options);
        return this;
    }

    static install(plugin, options = {}) {
        PluginManager.register(this, plugin, options);
        return this;
    }

    static async uninstall(pluginName) {
        await PluginManager.uninstall(this, pluginName);
        return this;
    }

    static enablePlugin(pluginName, enable = true) {
        PluginManager.enablePlugin(this, pluginName, enable);
        return this;
    }

    static disablePlugin(pluginName) {
        PluginManager.disablePlugin(this, pluginName);
        return this;
    }

    static isPluginEnabled(pluginName) {
        return PluginManager.isPluginEnabled(this, pluginName);
    }

    static plugins() {
        this.bootIfNeeded();
        return PluginManager.plugins(this);
    }

    static capabilities() {
        this.bootIfNeeded();
        return PluginManager.capabilities(this);
    }

    static async pluginDoctor() {
        this.bootIfNeeded();
        return await PluginManager.pluginDoctor(this);
    }

    static pluginMetrics(pluginName) {
        return PluginManager.pluginMetrics(this, pluginName);
    }

    static extensionGraph() {
        return PluginManager.extensionGraph(this);
    }

    static observe(observer, priority = 10) {
        ModelEventBus.observe(this, observer, priority);
        return this;
    }

    static on(event, callback, priority = 10) {
        ModelEventBus.on(this, event, callback, priority);
        return this;
    }
}
