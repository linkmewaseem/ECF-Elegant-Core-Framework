import BatchStrategy from "./BatchStrategy.js";

export default class SqlBatchStrategy extends BatchStrategy {
    async batchQuery(relation, parentModels, constraint = null) {
        if (!Array.isArray(parentModels) || parentModels.length === 0) {
            return [];
        }

        const type = relation.meta.type;

        if (type === "hasOne" || type === "hasMany") {
            const localKey = relation.meta.localKey;
            const foreignKey = relation.meta.foreignKey;

            const parentKeys = [...new Set(parentModels.map(m => m.getAttribute(localKey)).filter(v => v !== null && v !== undefined))];
            if (parentKeys.length === 0) return [];

            let query = relation.related.query().whereIn(foreignKey, parentKeys);
            if (typeof constraint === "function") {
                const res = constraint(query);
                if (res) query = res;
            }

            const rawQ = query.clone();
            rawQ._modelRepository = null;
            const rows = await rawQ.get();
            return rows.map(r => relation.related.repository().instantiateModel(r));
        }

        if (type === "belongsTo") {
            const foreignKey = relation.meta.foreignKey;
            const ownerKey = relation.meta.localKey;

            const foreignKeys = [...new Set(parentModels.map(m => m.getAttribute(foreignKey)).filter(v => v !== null && v !== undefined))];
            if (foreignKeys.length === 0) return [];

            let query = relation.related.query().whereIn(ownerKey, foreignKeys);
            if (typeof constraint === "function") {
                const res = constraint(query);
                if (res) query = res;
            }

            const rawQ = query.clone();
            rawQ._modelRepository = null;
            const rows = await rawQ.get();
            return rows.map(r => relation.related.repository().instantiateModel(r));
        }

        if (type === "belongsToMany") {
            const parentKey = relation.meta.localKey;
            const pivotTable = relation.meta.pivotTable;
            const foreignPivotKey = relation.meta.foreignPivotKey;
            const relatedPivotKey = relation.meta.relatedPivotKey;

            const parentKeys = [...new Set(parentModels.map(m => m.getAttribute(parentKey)).filter(v => v !== null && v !== undefined))];
            if (parentKeys.length === 0) return [];

            const repo = relation.related.repository();
            const relatedTable = repo.getTable();
            const relatedKey = relation.relatedKey || relation.related.primaryKey || "id";

            let query = relation.related.query()
                .join(pivotTable, `${relatedTable}.${relatedKey}`, "=", `${pivotTable}.${relatedPivotKey}`)
                .whereIn(`${pivotTable}.${foreignPivotKey}`, parentKeys)
                .select(`${relatedTable}.*`, `${pivotTable}.${foreignPivotKey} as __pivot_parent_id`);

            if (typeof constraint === "function") {
                const res = constraint(query);
                if (res) query = res;
            }

            const rawQ = query.clone();
            rawQ._modelRepository = null;
            const rows = await rawQ.get();
            return rows.map(r => {
                const model = relation.related.repository().instantiateModel(r);
                if (r.__pivot_parent_id !== undefined) {
                    model.forceFill({ __pivot_parent_id: r.__pivot_parent_id });
                }
                return model;
            });
        }

        return [];
    }
}
