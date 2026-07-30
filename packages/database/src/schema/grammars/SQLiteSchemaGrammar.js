import SchemaGrammar from "./SchemaGrammar.js";

export default class SQLiteSchemaGrammar extends SchemaGrammar {
    constructor() {
        super();
        this.supports = {
            alter: true,
            after: false,
            first: false,
            renameColumn: true,
            dropColumn: true,
            foreignKeys: true,
            json: true
        };
    }

    compileColumn(column) {
        if (column.get("autoIncrement") && (column.type === "integer" || column.type === "bigInteger")) {
            let sql = `${this.wrap(column.name)} INTEGER PRIMARY KEY AUTOINCREMENT`;
            return sql;
        }

        return super.compileColumn(column);
    }

    compileModifiers(column) {
        let sql = "";

        if (column.get("nullable") === false) {
            sql += " NOT NULL";
        } else if (column.get("nullable") === true) {
            sql += " NULL";
        }

        if (column.get("default") !== null) {
            sql += ` DEFAULT ${this.getDefaultValue(column.get("default"))}`;
        } else if (column.get("useCurrent")) {
            sql += " DEFAULT CURRENT_TIMESTAMP";
        }

        if (column.get("primary") && !column.get("autoIncrement")) {
            sql += " PRIMARY KEY";
        }

        if (column.get("unique")) {
            sql += " UNIQUE";
        }

        return sql;
    }

    compileHasTable(table) {
        return {
            sql: "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
            bindings: [table]
        };
    }

    compileHasColumn(table, column) {
        return {
            sql: `PRAGMA table_info(${this.wrap(table)})`,
            bindings: [],
            filter: (rows) => rows.some(r => r.name === column)
        };
    }

    typeBoolean() {
        return "INTEGER";
    }

    typeJson() {
        return "TEXT";
    }

    typeUuid() {
        return "TEXT";
    }
}
