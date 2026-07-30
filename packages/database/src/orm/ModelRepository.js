import DB from "../facades/DB.js";
import PluginManager from "./PluginManager.js";
import ModelCollection from "./ModelCollection.js";
import RelationLoader from "./loader/RelationLoader.js";
import AggregateLoader from "./loader/AggregateLoader.js";
import ModelEventBus from "./events/ModelEventBus.js";
import EventContext from "./events/EventContext.js";

export default class ModelRepository {
    #modelClass;
    #connection;

    constructor(modelClass, connection = null) {
        this.#modelClass = modelClass;
        this.#connection = connection;
    }

    get modelClass() {
        return this.#modelClass;
    }

    getConnection() {
        if (this.#connection) {
            return this.#connection;
        }
        const connName = this.#modelClass.connection;
        return connName ? DB.connection(connName) : DB.connection();
    }

    getTable() {
        if (this.#modelClass.table) {
            return this.#modelClass.table;
        }
        const name = this.#modelClass.name.toLowerCase();
        return name.endsWith("s") ? name : `${name}s`;
    }

    getPrimaryKey() {
        return this.#modelClass.primaryKey || "id";
    }

    query() {
        this.#modelClass.bootIfNeeded();
        const conn = this.getConnection();
        const table = this.getTable();
        const q = conn.table(table);
        q._modelRepository = this;
        q._pendingScopes = [...(this.#modelClass.getGlobalScopes() || [])];
        return q;
    }

    where(field, operator, value) {
        return this.query().where(field, operator, value);
    }

    with(...relations) {
        return this.query().with(...relations);
    }

    withCount(...relations) {
        return this.query().withCount(...relations);
    }

    withExists(...relations) {
        return this.query().withExists(...relations);
    }

    withSum(relation, column, alias = null) {
        return this.query().withSum(relation, column, alias);
    }

    withAvg(relation, column, alias = null) {
        return this.query().withAvg(relation, column, alias);
    }

    withMin(relation, column, alias = null) {
        return this.query().withMin(relation, column, alias);
    }

    withMax(relation, column, alias = null) {
        return this.query().withMax(relation, column, alias);
    }

    profile(...profileNames) {
        return this.query().profile(...profileNames);
    }

    resolveProfiles(profileNames = []) {
        const profilesDef = this.#modelClass.profiles || {};
        const result = {
            eagerLoads: [],
            withCounts: [],
            withExists: [],
            withAggregates: []
        };

        const resolveName = (name, visited = new Set()) => {
            const cleanName = name.startsWith("@") ? name.slice(1) : name;
            if (visited.has(cleanName)) return;
            visited.add(cleanName);

            const def = profilesDef[cleanName];
            if (!def) return;

            if (Array.isArray(def)) {
                for (const item of def) {
                    if (typeof item === "string" && item.startsWith("@")) {
                        resolveName(item, visited);
                    } else {
                        result.eagerLoads.push(item);
                    }
                }
            } else if (typeof def === "object" && def !== null) {
                if (def.relations) result.eagerLoads.push(def.relations);
                if (def.counts) result.withCounts.push(...def.counts);
                if (def.exists) result.withExists.push(...def.exists);
                if (def.aggregates) result.withAggregates.push(...def.aggregates);
            }
        };

        for (const p of profileNames) {
            resolveName(p);
        }

        return result;
    }

    async get(queryBuilder = null) {
        let q = queryBuilder || this.query();
        q = await q.applyScopes();

        // Smart Profile Composition & Inheritance
        if (q.ast.profiles && q.ast.profiles.length > 0) {
            const prof = this.resolveProfiles(q.ast.profiles);
            if (prof.eagerLoads.length > 0) q = q.with(prof.eagerLoads);
            if (prof.withCounts.length > 0) q = q.withCount(prof.withCounts);
            if (prof.withExists.length > 0) q = q.withExists(prof.withExists);
            for (const agg of prof.withAggregates) {
                q = q.withSum(agg.relation, agg.column, agg.alias);
            }
        }

        const ast = q.ast;

        // Execute raw query bypassing recursion
        const rawQ = q.clone();
        rawQ._modelRepository = null;
        const rows = await rawQ.get();

        const models = rows.map(r => this.instantiateModel(r));
        const collection = new ModelCollection(models);

        if (models.length === 0) {
            return collection;
        }

        // RelationLoader batch eager loading
        if (ast.eagerLoads && ast.eagerLoads.length > 0) {
            await RelationLoader.load(collection, ast.eagerLoads);
        }

        // AggregateLoader for withCount
        if (ast.withCounts && ast.withCounts.length > 0) {
            for (const name of ast.withCounts) {
                await AggregateLoader.loadCount(models, name);
            }
        }

        // AggregateLoader for withExists
        if (ast.withExists && ast.withExists.length > 0) {
            for (const name of ast.withExists) {
                await AggregateLoader.loadExists(models, name);
            }
        }

        // AggregateLoader for withAggregates
        if (ast.withAggregates && ast.withAggregates.length > 0) {
            for (const agg of ast.withAggregates) {
                await AggregateLoader.loadAggregate(models, agg.relation, agg.column, agg.type, agg.alias);
            }
        }

        if (ast.isDebug) {
            collection._debugReport = {
                queries: 1 + (ast.eagerLoads.length > 0 ? 1 : 0) + ast.withCounts.length + ast.withExists.length + ast.withAggregates.length,
                hydratedModels: models.length,
                profilesApplied: ast.profiles
            };
        }

        return collection;
    }

    async all() {
        return this.get();
    }

    async find(id) {
        const pk = this.getPrimaryKey();
        const row = await this.query().where(pk, id).first();
        return row ? this.instantiateModel(row) : null;
    }

    async findOrFail(id) {
        const model = await this.find(id);
        if (!model) {
            throw new Error(`[ModelRepository] ${this.#modelClass.name} with key '${id}' not found.`);
        }
        return model;
    }

    async create(attributes = {}) {
        const model = new this.#modelClass(attributes);
        await this.save(model);
        return model;
    }

    async save(model) {
        const pk = this.getPrimaryKey();
        const isNew = !model.getAttribute(pk);
        const conn = this.getConnection();
        const inTx = conn ? conn.inTransaction() : false;
        const original = model.getOriginal() || {};
        const changes = isNew ? model.getAttributeManager().getRawAttributes() : model.getChanges();

        // 1. Pre-event: saving
        const savingCtx = new EventContext({
            event: "saving",
            model,
            changes,
            original,
            connection: conn,
            inTransaction: inTx
        });
        const canSave = await ModelEventBus.dispatch(savingCtx);
        await PluginManager.dispatch(model, "saving");
        if (canSave === false) return false;

        // 2. Pre-event: creating / updating
        const actionEvent = isNew ? "creating" : "updating";
        const actionCtx = new EventContext({
            event: actionEvent,
            model,
            changes,
            original,
            connection: conn,
            inTransaction: inTx
        });
        const canAction = await ModelEventBus.dispatch(actionCtx);
        await PluginManager.dispatch(model, actionEvent);
        if (canAction === false) return false;

        if (Object.keys(changes).length > 0) {
            if (isNew) {
                const insertRes = await conn.table(this.getTable()).insert(changes);
                if (insertRes && insertRes.insertId && !model.getAttribute(pk)) {
                    model.setAttribute(pk, insertRes.insertId);
                }
            } else {
                await conn.table(this.getTable()).where(pk, model.getAttribute(pk)).update(changes);
            }
        }

        model.getAttributeManager().syncOriginal();
        model.getAttributeManager().incrementCacheVersion();

        // 3. Post-event: created / updated & saved
        const postActionEvent = isNew ? "created" : "updated";
        const postActionCtx = new EventContext({
            event: postActionEvent,
            model,
            changes,
            original,
            connection: conn,
            inTransaction: inTx
        });
        await ModelEventBus.dispatch(postActionCtx);
        await PluginManager.dispatch(model, postActionEvent);

        const savedCtx = new EventContext({
            event: "saved",
            model,
            changes,
            original,
            connection: conn,
            inTransaction: inTx
        });
        await ModelEventBus.dispatch(savedCtx);
        await PluginManager.dispatch(model, "saved");

        return model;
    }

    async delete(model) {
        const pk = this.getPrimaryKey();
        const id = model.getAttribute(pk);
        if (!id) return false;

        const conn = this.getConnection();
        const inTx = conn ? conn.inTransaction() : false;
        const original = model.getAttributeManager().getRawAttributes();

        const deletingCtx = new EventContext({
            event: "deleting",
            model,
            changes: {},
            original,
            connection: conn,
            inTransaction: inTx
        });
        const canDelete = await ModelEventBus.dispatch(deletingCtx);
        await PluginManager.dispatch(model, "deleting");
        if (canDelete === false) return false;

        await conn.table(this.getTable()).where(pk, id).delete();

        const deletedCtx = new EventContext({
            event: "deleted",
            model,
            changes: {},
            original,
            connection: conn,
            inTransaction: inTx
        });
        await ModelEventBus.dispatch(deletedCtx);
        await PluginManager.dispatch(model, "deleted");

        return true;
    }

    instantiateModel(row) {
        if (!row) return null;
        if (typeof row.getAttribute === "function") {
            return row;
        }
        const instance = new this.#modelClass(row, true);
        instance.getAttributeManager().syncOriginal();

        const conn = this.getConnection();
        const ctx = new EventContext({
            event: "retrieved",
            model: instance,
            changes: {},
            original: instance.getAttributeManager().getRawAttributes(),
            connection: conn,
            inTransaction: conn ? conn.inTransaction() : false
        });
        ModelEventBus.dispatch(ctx);

        return instance;
    }
}
