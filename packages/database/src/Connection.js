import { TransactionException } from "./exceptions/DatabaseExceptions.js";
import QueryBuilder from "./query/QueryBuilder.js";
import SQLiteGrammar from "./query/grammars/SQLiteGrammar.js";
import MySQLGrammar from "./query/grammars/MySQLGrammar.js";
import PostgreSQLGrammar from "./query/grammars/PostgreSQLGrammar.js";

import SchemaBuilder from "./schema/SchemaBuilder.js";
import SQLiteSchemaGrammar from "./schema/grammars/SQLiteSchemaGrammar.js";
import MySQLSchemaGrammar from "./schema/grammars/MySQLSchemaGrammar.js";
import PostgreSQLSchemaGrammar from "./schema/grammars/PostgreSQLSchemaGrammar.js";

import PreparedStatementCache from "./query/cache/PreparedStatementCache.js";

export default class Connection {
    #driver;
    #name;
    #grammar;
    #schemaGrammar;
    #transactionLevel = 0;
    #eventDispatcher = null;
    #statementCache;
    #profiler = null;
    #metrics = null;

    constructor(name, driver, eventDispatcher = null) {
        this.#name = name;
        this.#driver = driver;
        this.#eventDispatcher = eventDispatcher;
        this.#grammar = this.resolveGrammar(driver);
        this.#schemaGrammar = this.resolveSchemaGrammar(driver);
        this.#statementCache = new PreparedStatementCache(this);
    }

    get name() {
        return this.#name;
    }

    get driver() {
        return this.#driver;
    }

    get grammar() {
        return this.#grammar;
    }

    get schemaGrammar() {
        return this.#schemaGrammar;
    }

    get statementCache() {
        return this.#statementCache;
    }

    setProfiler(profiler) {
        this.#profiler = profiler;
    }

    setMetrics(metrics) {
        this.#metrics = metrics;
    }

    resolveGrammar(driver) {
        const driverName = driver.constructor.name.toLowerCase();
        if (driverName.includes("mysql")) return new MySQLGrammar();
        if (driverName.includes("postgres")) return new PostgreSQLGrammar();
        return new SQLiteGrammar();
    }

    resolveSchemaGrammar(driver) {
        const driverName = driver.constructor.name.toLowerCase();
        if (driverName.includes("mysql")) return new MySQLSchemaGrammar();
        if (driverName.includes("postgres")) return new PostgreSQLSchemaGrammar();
        return new SQLiteSchemaGrammar();
    }

    // Query & Schema Builder Factories

    queryBuilder() {
        return new QueryBuilder(this, this.#grammar);
    }

    getSchemaBuilder() {
        return new SchemaBuilder(this, this.#schemaGrammar);
    }

    table(tableName) {
        return this.queryBuilder().from(tableName);
    }

    // Connection State Inspection

    isConnected() {
        return this.#driver.connected;
    }

    inTransaction() {
        return this.#transactionLevel > 0;
    }

    transactionLevel() {
        return this.#transactionLevel;
    }

    setEventDispatcher(dispatcher) {
        this.#eventDispatcher = dispatcher;
    }

    async connect() {
        if (!this.isConnected()) {
            await this.#driver.connect();
            this.dispatchEvent("ConnectionOpened", { connection: this.#name });
        }
        return this;
    }

    async disconnect() {
        if (this.isConnected()) {
            await this.#driver.disconnect();
            this.dispatchEvent("ConnectionClosed", { connection: this.#name });
        }
    }

    async query(sql, bindings = []) {
        if (!this.isConnected()) {
            await this.connect();
        }

        if (this.#metrics) {
            this.#metrics.increment("Queries", "total");
            this.#metrics.increment("Drivers", "statementExecutions");
        }

        let traceId = null;
        if (this.#profiler && this.#profiler.isEnabled()) {
            traceId = this.#profiler.startQuery(sql, bindings, { connection: this.#name });
        }

        const start = performance.now();
        try {
            // Check prepared statement cache
            let stmt = this.#statementCache.get(sql);
            if (!stmt) {
                stmt = this.#statementCache.put(sql, { sql });
            }

            const result = await this.#driver.query(sql, bindings);
            const timeMs = Number((performance.now() - start).toFixed(2));

            if (this.#profiler && traceId) {
                this.#profiler.stopQuery(traceId, result);
            }

            this.dispatchEvent("QueryExecuted", {
                connection: this.#name,
                sql,
                bindings,
                timeMs,
                result
            });

            return result;
        } catch (err) {
            const timeMs = Number((performance.now() - start).toFixed(2));
            if (this.#profiler && traceId) {
                this.#profiler.stopQuery(traceId, null, err);
            }
            this.dispatchEvent("QueryFailed", {
                connection: this.#name,
                sql,
                bindings,
                timeMs,
                error: err
            });
            throw err;
        }
    }

    async execute(sql, bindings = []) {
        return this.query(sql, bindings);
    }

    async select(sql, bindings = []) {
        const res = await this.query(sql, bindings);
        return res.rows;
    }

    async insert(sql, bindings = []) {
        return this.query(sql, bindings);
    }

    async update(sql, bindings = []) {
        return this.query(sql, bindings);
    }

    async delete(sql, bindings = []) {
        return this.query(sql, bindings);
    }

    // Transaction Management

    async beginTransaction() {
        if (!this.isConnected()) {
            await this.connect();
        }

        this.#transactionLevel++;

        if (this.#transactionLevel === 1) {
            await this.#driver.beginTransaction();
            this.dispatchEvent("TransactionStarted", { connection: this.#name, level: 1 });
        } else if (this.#driver.supports.savepoints) {
            const savepointName = `sp_${this.#transactionLevel}`;
            await this.#driver.execute(`SAVEPOINT ${savepointName}`);
            this.dispatchEvent("TransactionStarted", { connection: this.#name, level: this.#transactionLevel, savepoint: savepointName });
        }
    }

    async commit() {
        if (this.#transactionLevel === 0) {
            throw new TransactionException("There is no active transaction to commit.");
        }

        if (this.#transactionLevel === 1) {
            await this.#driver.commit();
            this.#transactionLevel = 0;
            this.dispatchEvent("TransactionCommitted", { connection: this.#name, level: 0 });
        } else {
            if (this.#driver.supports.savepoints) {
                const savepointName = `sp_${this.#transactionLevel}`;
                await this.#driver.execute(`RELEASE SAVEPOINT ${savepointName}`);
            }
            this.#transactionLevel--;
            this.dispatchEvent("TransactionCommitted", { connection: this.#name, level: this.#transactionLevel });
        }
    }

    async rollback() {
        if (this.#transactionLevel === 0) {
            throw new TransactionException("There is no active transaction to roll back.");
        }

        if (this.#transactionLevel === 1) {
            await this.#driver.rollback();
            this.#transactionLevel = 0;
            this.dispatchEvent("TransactionRolledBack", { connection: this.#name, level: 0 });
        } else {
            if (this.#driver.supports.savepoints) {
                const savepointName = `sp_${this.#transactionLevel}`;
                await this.#driver.execute(`ROLLBACK TO SAVEPOINT ${savepointName}`);
            }
            this.#transactionLevel--;
            this.dispatchEvent("TransactionRolledBack", { connection: this.#name, level: this.#transactionLevel });
        }
    }

    /**
     * Execute callback closure inside an automatic transaction.
     */
    async transaction(callback) {
        await this.beginTransaction();
        try {
            const result = await callback(this);
            await this.commit();
            return result;
        } catch (err) {
            await this.rollback();
            throw err;
        }
    }

    dispatchEvent(eventName, payload) {
        if (!this.#eventDispatcher) return;
        if (typeof this.#eventDispatcher.dispatch === "function") {
            this.#eventDispatcher.dispatch(eventName, payload);
        } else if (typeof this.#eventDispatcher.emit === "function") {
            this.#eventDispatcher.emit(eventName, payload);
        } else if (typeof this.#eventDispatcher === "function") {
            this.#eventDispatcher(eventName, payload);
        }
    }
}
