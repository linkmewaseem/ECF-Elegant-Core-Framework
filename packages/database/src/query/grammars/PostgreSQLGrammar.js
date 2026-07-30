import Grammar from "../Grammar.js";

export default class PostgreSQLGrammar extends Grammar {
    wrapValue(value) {
        if (value === "*") return "*";
        return `"${value.replace(/"/g, '""')}"`;
    }

    /**
     * Override compileSelect to transform ? into $1, $2, $3... for Postgres.
     */
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

    parameterizeSql(sql, bindings) {
        let index = 1;
        const parameterizedSql = sql.replace(/\?/g, () => `$${index++}`);
        return { sql: parameterizedSql, bindings };
    }
}
