import Grammar from "../Grammar.js";

export default class PostgreSQLGrammar extends Grammar {
    wrapValue(value) {
        if (value === "*") return "*";
        return `"${value.replace(/"/g, '""')}"`;
    }

    compileSelect(ast) {
        const res = super.compileSelect(ast);
        return this.parameterizeSql(res.sql, res.bindings);
    }

    compileInsert(ast, values) {
        const res = super.compileInsert(ast, values);
        return this.parameterizeSql(res.sql, res.bindings);
    }

    compileUpdate(ast, values) {
        const res = super.compileUpdate(ast, values);
        return this.parameterizeSql(res.sql, res.bindings);
    }

    compileDelete(ast) {
        const res = super.compileDelete(ast);
        return this.parameterizeSql(res.sql, res.bindings);
    }

    compileExplain(ast, mode = "plain") {
        const selectRes = super.compileSelect(ast);
        let prefix = "EXPLAIN ";
        if (mode === "analyze") prefix = "EXPLAIN (ANALYZE, FORMAT JSON) ";
        else if (mode === "json") prefix = "EXPLAIN (FORMAT JSON) ";
        return this.parameterizeSql(`${prefix}${selectRes.sql}`, selectRes.bindings);
    }

    compileUpsert(ast, records, uniqueKeys = ["id"], updateColumns = null) {
        const insertRes = super.compileInsert(ast, records);
        if (!insertRes.sql) return insertRes;

        const recordList = Array.isArray(records) ? records : [records];
        const columns = Object.keys(recordList[0]);
        const updates = updateColumns || columns.filter(c => !uniqueKeys.includes(c));

        const keysConflict = uniqueKeys.map(k => this.wrap(k)).join(", ");
        const updateSet = updates.map(u => `${this.wrap(u)} = EXCLUDED.${this.wrap(u)}`).join(", ");

        const rawSql = `${insertRes.sql} ON CONFLICT (${keysConflict}) DO UPDATE SET ${updateSet}`;
        return this.parameterizeSql(rawSql, insertRes.bindings);
    }

    parameterizeSql(sql, bindings) {
        let index = 1;
        const parameterizedSql = sql.replace(/\?/g, () => `$${index++}`);
        return { sql: parameterizedSql, bindings };
    }
}
