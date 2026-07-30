export default class CompiledStatement {
    constructor(sql, bindings = []) {
        this.sql = sql;
        this.bindings = bindings;
    }

    static make(sql, bindings = []) {
        if (sql instanceof CompiledStatement) {
            return sql;
        }
        if (typeof sql === "object" && sql !== null && "sql" in sql) {
            return new CompiledStatement(sql.sql, sql.bindings || []);
        }
        return new CompiledStatement(sql, bindings);
    }
}
