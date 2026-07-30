import DB from "../../facades/DB.js";

export default class AggregateLoader {
    static async loadCount(parentModels, relationName, alias = null) {
        if (!Array.isArray(parentModels) || parentModels.length === 0) return;
        const targetAlias = alias || `${relationName}_count`;

        const sample = parentModels[0];
        if (typeof sample[relationName] !== "function") return;

        const rel = sample[relationName]();
        const type = rel.meta.type;
        const repo = rel.related.repository();
        const table = repo.getTable();

        if (type === "hasOne" || type === "hasMany") {
            const foreignKey = rel.meta.foreignKey;
            const localKey = rel.meta.localKey;

            const parentKeys = [...new Set(parentModels.map(m => m.getAttribute(localKey)).filter(v => v !== null && v !== undefined))];
            if (parentKeys.length === 0) return;

            const conn = repo.getConnection();
            const rows = await conn.table(table)
                .select(foreignKey, DB.raw("COUNT(*) as aggregate"))
                .whereIn(foreignKey, parentKeys)
                .groupBy(foreignKey)
                .get();

            const countMap = new Map();
            for (const r of rows) {
                const fk = r[foreignKey];
                const countVal = Number(r.aggregate) || 0;
                countMap.set(fk, countVal);
            }

            for (const parent of parentModels) {
                const pk = parent.getAttribute(localKey);
                parent.forceFill({ [targetAlias]: countMap.get(pk) || 0 });
            }
        } else if (type === "belongsToMany") {
            const parentKey = rel.meta.localKey;
            const pivotTable = rel.meta.pivotTable;
            const foreignPivotKey = rel.meta.foreignPivotKey;

            const parentKeys = [...new Set(parentModels.map(m => m.getAttribute(parentKey)).filter(v => v !== null && v !== undefined))];
            if (parentKeys.length === 0) return;

            const conn = repo.getConnection();
            const rows = await conn.table(pivotTable)
                .select(foreignPivotKey, DB.raw("COUNT(*) as aggregate"))
                .whereIn(foreignPivotKey, parentKeys)
                .groupBy(foreignPivotKey)
                .get();

            const countMap = new Map();
            for (const r of rows) {
                const fk = r[foreignPivotKey];
                const countVal = Number(r.aggregate) || 0;
                countMap.set(fk, countVal);
            }

            for (const parent of parentModels) {
                const pk = parent.getAttribute(parentKey);
                parent.forceFill({ [targetAlias]: countMap.get(pk) || 0 });
            }
        }
    }

    static async loadExists(parentModels, relationName, alias = null) {
        if (!Array.isArray(parentModels) || parentModels.length === 0) return;
        const targetAlias = alias || `has_${relationName}`;

        await AggregateLoader.loadCount(parentModels, relationName, "__temp_count");

        for (const parent of parentModels) {
            const count = parent.getAttribute("__temp_count") || 0;
            parent.forceFill({ [targetAlias]: count > 0 });
            delete parent.getAttributeManager().attributes["__temp_count"];
        }
    }

    static async loadAggregate(parentModels, relationName, column, aggregateType = "sum", alias = null) {
        if (!Array.isArray(parentModels) || parentModels.length === 0) return;
        const targetAlias = alias || `${relationName}_${aggregateType}_${column}`;

        const sample = parentModels[0];
        if (typeof sample[relationName] !== "function") return;

        const rel = sample[relationName]();
        const type = rel.meta.type;
        const repo = rel.related.repository();
        const table = repo.getTable();

        if (type === "hasOne" || type === "hasMany") {
            const foreignKey = rel.meta.foreignKey;
            const localKey = rel.meta.localKey;

            const parentKeys = [...new Set(parentModels.map(m => m.getAttribute(localKey)).filter(v => v !== null && v !== undefined))];
            if (parentKeys.length === 0) return;

            const fnUpper = aggregateType.toUpperCase();
            const conn = repo.getConnection();

            const rows = await conn.table(table)
                .select(foreignKey, DB.raw(`${fnUpper}(${column}) as aggregate`))
                .whereIn(foreignKey, parentKeys)
                .groupBy(foreignKey)
                .get();

            const resultMap = new Map();
            for (const r of rows) {
                const fk = r[foreignKey];
                const val = r.aggregate !== null && r.aggregate !== undefined ? Number(r.aggregate) : null;
                resultMap.set(fk, val);
            }

            for (const parent of parentModels) {
                const pk = parent.getAttribute(localKey);
                parent.forceFill({ [targetAlias]: resultMap.get(pk) ?? 0 });
            }
        }
    }
}
