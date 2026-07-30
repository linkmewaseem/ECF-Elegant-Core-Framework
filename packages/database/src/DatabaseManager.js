import Expression from "./query/Expression.js";
import MigrationRepository from "./migrations/MigrationRepository.js";
import Migrator from "./migrations/Migrator.js";

export default class DatabaseManager {
    #manager;

    constructor(connectionManager) {
        this.#manager = connectionManager;
    }

    get manager() {
        return this.#manager;
    }

    connection(name = null) {
        return this.#manager.connection(name);
    }

    table(tableName) {
        return this.connection().table(tableName);
    }

    schema(name = null) {
        return this.connection(name).getSchemaBuilder();
    }

    getSchemaBuilder(name = null) {
        return this.schema(name);
    }

    migrator(options = {}) {
        const conn = this.connection(options.connection || null);
        const table = options.table || "migrations";
        const repository = new MigrationRepository(conn, table);
        return new Migrator(repository, conn);
    }

    raw(value) {
        return new Expression(value);
    }

    registerDriver(name, DriverClass) {
        this.#manager.registerDriver(name, DriverClass);
        return this;
    }

    async query(sql, bindings = []) {
        return this.connection().query(sql, bindings);
    }

    async select(sql, bindings = []) {
        return this.connection().select(sql, bindings);
    }

    async insert(sql, bindings = []) {
        return this.connection().insert(sql, bindings);
    }

    async update(sql, bindings = []) {
        return this.connection().update(sql, bindings);
    }

    async delete(sql, bindings = []) {
        return this.connection().delete(sql, bindings);
    }

    async transaction(callback) {
        return this.connection().transaction(callback);
    }

    async disconnect(name = null) {
        return this.#manager.disconnect(name);
    }

    async disconnectAll() {
        return this.#manager.disconnectAll();
    }
}
