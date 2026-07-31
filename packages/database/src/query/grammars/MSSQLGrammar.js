import Grammar from "../Grammar.js";

export default class MSSQLGrammar extends Grammar {
    wrapValue(value) {
        if (value === "*") return "*";
        return `[${value.replace(/\]/g, "]]")}]`;
    }

    compileSelect(ast) {
        const copyAst = { ...ast };
        // Handle MSSQL TOP / OFFSET FETCH syntax if needed
        const res = super.compileSelect(copyAst);
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
        const selectRes = this.compileSelect(ast);
        return {
            sql: `EXPLAIN ${selectRes.sql}`,
            bindings: selectRes.bindings
        };
    }

    compileUpsert(ast, records, uniqueKeys, updateColumns) {
        const target = this.wrap(ast.table);
        const recordList = Array.isArray(records) ? records : [records];
        if (recordList.length === 0) return { sql: "", bindings: [] };

        const cols = Object.keys(recordList[0]);
        const colsSql = cols.map(c => this.wrap(c)).join(", ");
        const matchCond = uniqueKeys.map(k => `target.${this.wrap(k)} = source.${this.wrap(k)}`).join(" AND ");

        const updateSet = updateColumns.map(c => `target.${this.wrap(c)} = source.${this.wrap(c)}`).join(", ");
        const insertCols = cols.map(c => `source.${this.wrap(c)}`).join(", ");

        const bindings = [];
        const rowsSql = recordList.map(r => {
            const rowValues = cols.map(c => {
                bindings.push(r[c]);
                return "?";
            });
            return `(${rowValues.join(", ")})`;
        }).join(", ");

        const sql = `MERGE INTO ${target} AS target USING (VALUES ${rowsSql}) AS source (${colsSql}) ON (${matchCond}) WHEN MATCHED THEN UPDATE SET ${updateSet} WHEN NOT MATCHED THEN INSERT (${colsSql}) VALUES (${insertCols});`;

        return this.parameterizeSql(sql, bindings);
    }

    parameterizeSql(sql, bindings) {
        let index = 1;
        const parameterizedSql = sql.replace(/\?/g, () => `@p${index++}`);
        return { sql: parameterizedSql, bindings };
    }
}
