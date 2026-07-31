import Grammar from "../Grammar.js";

export default class SQLiteGrammar extends Grammar {
    wrapValue(value) {
        if (value === "*") return "*";
        return `"${value.replace(/"/g, '""')}"`;
    }

    compileTruncate(ast) {
        return { sql: `DELETE FROM ${this.wrap(ast.table)}`, bindings: [] };
    }

    compileExplain(ast, mode = "plain") {
        const selectRes = this.compileSelect(ast);
        return {
            sql: `EXPLAIN QUERY PLAN ${selectRes.sql}`,
            bindings: selectRes.bindings
        };
    }
}
