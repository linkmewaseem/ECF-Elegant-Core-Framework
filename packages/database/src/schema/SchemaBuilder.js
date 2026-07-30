import Blueprint from "./Blueprint.js";

export default class SchemaBuilder {
    #connection;
    #grammar;

    constructor(connection, grammar = null) {
        this.#connection = connection;
        this.#grammar = grammar || connection.schemaGrammar;
    }

    get connection() {
        return this.#connection;
    }

    get grammar() {
        return this.#grammar;
    }

    connection(name) {
        if (!this.#connection || typeof this.#connection.getSchemaBuilder !== "function") {
            throw new Error(`[SchemaBuilder] Cannot resolve target connection without a valid Connection instance.`);
        }
        return this.#connection.getSchemaBuilder(name);
    }

    async create(table, callback) {
        const blueprint = new Blueprint(table);
        blueprint.create();

        if (typeof callback === "function") {
            callback(blueprint);
        }

        const statements = blueprint.toSql(this.#grammar);
        await this.#executeStatements(statements);
    }

    async table(table, callback) {
        const blueprint = new Blueprint(table);

        if (typeof callback === "function") {
            callback(blueprint);
        }

        const statements = blueprint.toSql(this.#grammar);
        await this.#executeStatements(statements);
    }

    async rename(from, to) {
        const stmt = this.#grammar.compileRenameTable(from, to);
        return this.#executeStatement(stmt);
    }

    async drop(table) {
        const stmt = this.#grammar.compileDropTable(table);
        return this.#executeStatement(stmt);
    }

    async dropIfExists(table) {
        const stmt = this.#grammar.compileDropTableIfExists(table);
        return this.#executeStatement(stmt);
    }

    async hasTable(table) {
        const { sql, bindings } = this.#grammar.compileHasTable(table);
        const rows = await this.#connection.select(sql, bindings || []);
        return rows && rows.length > 0;
    }

    async hasColumn(table, column) {
        const { sql, bindings, filter } = this.#grammar.compileHasColumn(table, column);
        const rows = await this.#connection.select(sql, bindings || []);

        if (typeof filter === "function") {
            return filter(rows);
        }

        return rows && rows.length > 0;
    }

    async #executeStatement(stmt) {
        const sql = typeof stmt === "string" ? stmt : stmt.sql;
        const bindings = typeof stmt === "object" && stmt !== null && stmt.bindings ? stmt.bindings : [];
        return this.#connection.execute(sql, bindings);
    }

    async #executeStatements(statements = []) {
        const runner = async () => {
            for (const stmt of statements) {
                await this.#executeStatement(stmt);
            }
        };

        if (statements.length > 1 && typeof this.#connection.transaction === "function") {
            await this.#connection.transaction(runner);
        } else {
            await runner();
        }
    }
}
