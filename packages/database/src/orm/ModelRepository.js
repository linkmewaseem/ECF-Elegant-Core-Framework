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

    instantiateModel(row) {
        if (!row) return null;
        const mgr = row.getAttributeManager ? row.getAttributeManager() : null;
        if (mgr) {
            mgr.syncOriginal();
            row._exists = true;
            row.exists = true;
            return row;
        }
        const model = new this.#modelClass(row);
        model.getAttributeManager().syncOriginal();
        model._exists = true;
        model.exists = true;
        return model;
    }

    async get(queryBuilder = null) {
        const qb = queryBuilder || this.query();
        const compiled = typeof qb.applyScopes === "function" ? qb.applyScopes() : qb;
        const { sql, bindings } = compiled.toSql();
        const conn = compiled._connection || this.getConnection();
        const res = await conn.select(sql, bindings);
        const rows = Array.isArray(res) ? res : (res?.rows || []);

        const models = rows.map(r => this.instantiateModel(r));
        return new ModelCollection(models);
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
        model._exists = false;
        model.exists = false;
        await this.save(model);
        return model;
    }

    async save(model) {
        const pk = this.getPrimaryKey();
        const isNew = !(model._exists || model.exists);
        const conn = this.getConnection();
        const inTx = conn ? conn.inTransaction() : false;
        const original = model.getOriginal() || {};

        // 1. Pre-event: saving
        const savingCtx = new EventContext({
            event: "saving",
            model,
            changes: model.getChanges(),
            original,
            connection: conn,
            inTransaction: inTx
        });
        const canSave = await ModelEventBus.dispatch(savingCtx);
        if (canSave === false) return false;

        // 2. Pre-event: creating / updating
        const actionEvent = isNew ? "creating" : "updating";
        const actionCtx = new EventContext({
            event: actionEvent,
            model,
            changes: isNew ? model.getAttributeManager().getRawAttributes() : model.getChanges(),
            original,
            connection: conn,
            inTransaction: inTx
        });
        const canAction = await ModelEventBus.dispatch(actionCtx);
        if (canAction === false) return false;

        // 3. Compute final changes payload after pre-event hooks mutated attributes
        const changes = isNew ? model.getAttributeManager().getRawAttributes() : model.getChanges();

        if (Object.keys(changes).length > 0) {
            if (isNew) {
                const insertRes = await conn.table(this.getTable()).insert(changes);
                if (insertRes && insertRes.insertId && !model.getAttribute(pk)) {
                    model.setAttribute(pk, insertRes.insertId);
                }
                model._exists = true;
                model.exists = true;
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

        const savedCtx = new EventContext({
            event: "saved",
            model,
            changes,
            original,
            connection: conn,
            inTransaction: inTx
        });
        await ModelEventBus.dispatch(savedCtx);

        return true;
    }

    async delete(model) {
        const pk = this.getPrimaryKey();
        const id = model.getAttribute(pk);
        if (!id) return false;

        const conn = this.getConnection();
        const inTx = conn ? conn.inTransaction() : false;

        const deletingCtx = new EventContext({
            event: "deleting",
            model,
            connection: conn,
            inTransaction: inTx
        });
        const canDelete = await ModelEventBus.dispatch(deletingCtx);
        if (canDelete === false) return false;

        await conn.table(this.getTable()).where(pk, id).delete();

        model._exists = false;
        model.exists = false;

        const deletedCtx = new EventContext({
            event: "deleted",
            model,
            connection: conn,
            inTransaction: inTx
        });
        await ModelEventBus.dispatch(deletedCtx);

        return true;
    }
}
