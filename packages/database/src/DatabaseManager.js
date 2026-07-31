import Expression from "./query/Expression.js";
import MigrationRepository from "./migrations/MigrationRepository.js";
import Migrator from "./migrations/Migrator.js";
import QueryCache from "./query/cache/QueryCache.js";
import QueryProfiler from "./profiler/QueryProfiler.js";
import QueryMetrics from "./profiler/QueryMetrics.js";

export default class DatabaseManager {
    #manager;
    #metrics;
    #profiler;
    #queryCache;

    constructor(connectionManager) {
        this.#manager = connectionManager;
        this.#metrics = new QueryMetrics();
        this.#profiler = new QueryProfiler();
        this.#queryCache = new QueryCache("memory", this.#metrics);
    }

    get manager() {
        return this.#manager;
    }

    get metrics() {
        return this.#metrics;
    }

    get profiler() {
        return this.#profiler;
    }

    get queryCache() {
        return this.#queryCache;
    }

    cacheStore(name = null) {
        return this.#queryCache.store(name);
    }

    getMetrics(category = null) {
        return this.#metrics.getMetrics(category);
    }

    resetMetrics(category = null) {
        return this.#metrics.resetMetrics(category);
    }

    enableProfiler() {
        this.#profiler.enable();
    }

    disableProfiler() {
        this.#profiler.disable();
    }

    connection(name = null) {
        const conn = this.#manager.connection(name);
        conn.setProfiler(this.#profiler);
        conn.setMetrics(this.#metrics);
        return conn;
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
