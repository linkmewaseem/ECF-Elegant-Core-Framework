export default class NamingStrategy {
    createIndexName(table, type, columns) {
        const cols = Array.isArray(columns) ? columns : [columns];
        return `${table}_${cols.join("_")}_${type}`.toLowerCase();
    }

    createForeignKeyName(table, columns) {
        return this.createIndexName(table, "foreign", columns);
    }

    createPrimaryName(table, columns) {
        return this.createIndexName(table, "primary", columns);
    }

    static singular(name) {
        if (!name) return "";
        const lower = name.toLowerCase();
        if (lower.endsWith("ies")) return `${lower.slice(0, -3)}y`;
        if (lower.endsWith("s") && !lower.endsWith("ss")) return lower.slice(0, -1);
        return lower;
    }

    static tableName(modelName) {
        if (!modelName) return "";
        const lower = modelName.toLowerCase();
        return lower.endsWith("s") ? lower : `${lower}s`;
    }

    static foreignKey(modelName, primaryKey = "id") {
        const sing = NamingStrategy.singular(modelName);
        return `${sing}_${primaryKey}`;
    }

    static pivotTableName(modelNameA, modelNameB) {
        const singA = NamingStrategy.singular(modelNameA);
        const singB = NamingStrategy.singular(modelNameB);
        const sorted = [singA, singB].sort();
        return `${sorted[0]}_${sorted[1]}`;
    }
}
