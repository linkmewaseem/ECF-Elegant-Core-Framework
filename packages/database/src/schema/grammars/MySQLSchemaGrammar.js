import SchemaGrammar from "./SchemaGrammar.js";

export default class MySQLSchemaGrammar extends SchemaGrammar {
    constructor() {
        super();
        this.supports = {
            alter: true,
            after: true,
            first: true,
            renameColumn: true,
            dropColumn: true,
            foreignKeys: true,
            json: true
        };
    }

    wrap(value) {
        if (typeof value !== "string") return "";
        if (value.includes(".")) {
            return value.split(".").map(part => this.wrap(part)).join(".");
        }
        return `\`${value.replace(/`/g, "``")}\``;
    }

    compileHasTable(table) {
        return {
            sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
            bindings: [table]
        };
    }

    compileHasColumn(table, column) {
        return {
            sql: "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?",
            bindings: [table, column]
        };
    }

    typeBoolean() {
        return "TINYINT(1)";
    }
}
