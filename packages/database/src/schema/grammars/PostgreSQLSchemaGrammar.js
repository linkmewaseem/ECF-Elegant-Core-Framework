import SchemaGrammar from "./SchemaGrammar.js";

export default class PostgreSQLSchemaGrammar extends SchemaGrammar {
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
        if (column.get("autoIncrement")) {
            if (column.type === "bigInteger") {
                return `${this.wrap(column.name)} BIGSERIAL PRIMARY KEY`;
            }
            return `${this.wrap(column.name)} SERIAL PRIMARY KEY`;
        }

        return super.compileColumn(column);
    }

    compileHasTable(table) {
        return {
            sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = $1",
            bindings: [table]
        };
    }

    compileHasColumn(table, column) {
        return {
            sql: "SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1 AND column_name = $2",
            bindings: [table, column]
        };
    }

    typeUuid() {
        return "UUID";
    }

    typeBinary() {
        return "BYTEA";
    }

    typeJson() {
        return "JSONB";
    }
}
