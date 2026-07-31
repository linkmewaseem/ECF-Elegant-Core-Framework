import Grammar from "../Grammar.js";

export default class MySQLGrammar extends Grammar {
    wrapValue(value) {
        if (value === "*") return "*";
        return `\`${value.replace(/`/g, "``")}\``;
    }

    compileExplain(ast, mode = "plain") {
        const selectRes = this.compileSelect(ast);
        const prefix = mode === "json" ? "EXPLAIN FORMAT=JSON " : "EXPLAIN ";
        return {
            sql: `${prefix}${selectRes.sql}`,
            bindings: selectRes.bindings
        };
    }

    compileUpsert(ast, records, uniqueKeys = ["id"], updateColumns = null) {
        const insertRes = this.compileInsert(ast, records);
        if (!insertRes.sql) return insertRes;

        const recordList = Array.isArray(records) ? records : [records];
        const columns = Object.keys(recordList[0]);
        const updates = updateColumns || columns.filter(c => !uniqueKeys.includes(c));

        const updateSet = updates.map(u => `${this.wrap(u)} = VALUES(${this.wrap(u)})`).join(", ");

        const sql = `${insertRes.sql} ON DUPLICATE KEY UPDATE ${updateSet}`;
        return { sql, bindings: insertRes.bindings };
    }
}
