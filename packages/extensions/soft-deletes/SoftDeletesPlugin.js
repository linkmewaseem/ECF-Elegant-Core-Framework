import Plugin from "../../database/src/orm/extensions/Plugin.js";

export default class SoftDeletesPlugin extends Plugin {
    constructor(options = {}) {
        super({
            id: "softDeletes",
            name: "@ecfjs/soft-deletes",
            version: "1.0.0",
            apiVersion: "1",
            framework: "^1.0.0",
            author: "ECF",
            keywords: ["orm", "soft-delete", "ecf"],
            provides: {
                softDeletes: "1.0.0"
            }
        });
        this.options = {
            column: options.column || "deleted_at",
            ...options
        };
    }

    async boot(ctx) {
        const modelClass = ctx.model;
        const col = this.options.column;

        // 1. Register Global Scope
        modelClass.addGlobalScope("softDeletes", {
            apply: (query) => query.whereNull(col),
            priority: 1
        });

        // 2. Attach Query & Model Static Delegators
        if (!modelClass.withTrashed) {
            modelClass.withTrashed = function() {
                return this.query().withoutGlobalScope("softDeletes");
            };
        }

        if (!modelClass.onlyTrashed) {
            modelClass.onlyTrashed = function() {
                return this.query().withoutGlobalScope("softDeletes").whereNotNull(col);
            };
        }

        if (!modelClass.withoutTrashed) {
            modelClass.withoutTrashed = function() {
                return this.query();
            };
        }

        if (!modelClass.restoreMany) {
            modelClass.restoreMany = async function(ids) {
                const pk = this.repository().getPrimaryKey();
                const cleanIds = ids.map(id => (id && typeof id.getAttribute === "function") ? id.getAttribute(pk) : (id?.id || id));
                return await this.withTrashed().whereIn(pk, cleanIds).update({ [col]: null });
            };
        }

        if (!modelClass.forceDestroy) {
            modelClass.forceDestroy = async function(ids) {
                const pk = this.repository().getPrimaryKey();
                const cleanIds = ids.map(id => (id && typeof id.getAttribute === "function") ? id.getAttribute(pk) : (id?.id || id));
                return await this.withTrashed().whereIn(pk, cleanIds).delete();
            };
        }

        if (!modelClass.trashOlderThan) {
            modelClass.trashOlderThan = async function(date) {
                const cutoff = date instanceof Date ? date.toISOString() : date;
                return await this.onlyTrashed().where(col, "<=", cutoff).delete();
            };
        }

        // 3. Attach Instance Methods via Prototype
        if (modelClass.prototype) {
            if (!modelClass.prototype.restore) {
                modelClass.prototype.restore = async function() {
                    this.setAttribute(col, null);
                    return await this.save();
                };
            }

            if (!modelClass.prototype.forceDelete) {
                modelClass.prototype.forceDelete = async function() {
                    this._forceDeleting = true;
                    const res = await this.delete();
                    this._forceDeleting = false;
                    return res;
                };
            }
        }

        // 4. Intercept Deleting Lifecycle Event
        ctx.events.on(modelClass, "deleting", async (eventCtx) => {
            const model = eventCtx.model;
            if (model._forceDeleting) {
                return true; // Proceed with physical deletion
            }

            // Perform Soft Delete
            model.setAttribute(col, new Date().toISOString());
            await model.save();
            return false; // Abort physical deletion
        });
    }
}
