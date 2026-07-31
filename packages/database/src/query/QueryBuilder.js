import Expression, { isExpression } from "./Expression.js";
import { WhereClause, OrderClause, JoinClause, AggregateClause } from "./Clause.js";
import SQLiteGrammar from "./grammars/SQLiteGrammar.js";
import PluginManager from "../orm/PluginManager.js";
import CompiledSqlCache from "./cache/CompiledSqlCache.js";

import BulkOperations from "./BulkOperations.js";
import CursorPagination from "./CursorPagination.js";
import ExplainEngine from "./ExplainEngine.js";

const globalCompiledCache = new CompiledSqlCache();

export default class QueryBuilder {
    static #macros = new Map();

    constructor(connection, grammar = new SQLiteGrammar()) {
        this._connection = connection;
        this._grammar = grammar;

        this._pendingScopes = [];
        this._removedScopes = new Set();
        this._scopeState = new Map();
        this._scopesApplied = false;
        this._removeAllGlobalScopes = false;
        this._cacheOptions = null;

        this._ast = {
            table: null,
            columns: [],
            wheres: [],
            orders: [],
            groups: [],
            joins: [],
            limit: null,
            offset: null,
            aggregate: null,
            eagerLoads: [],
            withCounts: [],
            withExists: [],
            withAggregates: [],
            profiles: [],
            isDebug: false
        };

        // Wrap in Proxy for dynamic macro & scope execution
        return new Proxy(this, {
            get(target, prop, receiver) {
                if (Reflect.has(target, prop)) {
                    const val = Reflect.get(target, prop, receiver);
                    return typeof val === "function" ? val.bind(target) : val;
                }

                if (QueryBuilder.#macros.has(prop)) {
                    const macroFn = QueryBuilder.#macros.get(prop);
                    return (...args) => macroFn.apply(target, args);
                }

                if (target._modelRepository) {
                    const modelClass = target._modelRepository.modelClass;
                    if (modelClass) {
                        modelClass.bootIfNeeded();
                        if (modelClass.meta?.scopes?.has(prop)) {
                            const scopeFn = modelClass.meta.scopes.get(prop);
                            return (...args) => {
                                const res = scopeFn.call(modelClass, target, ...args);
                                return res instanceof QueryBuilder ? res : target;
                            };
                        }
                    }
                }

                return undefined;
            }
        });
    }

    get connection() { return this._connection; }
    get grammar() { return this._grammar; }
    get ast() { return this._ast; }

    // Macro System

    static macro(name, fn) {
        if (typeof name === "string" && typeof fn === "function") {
            QueryBuilder.#macros.set(name, fn);
        }
    }

    macro(name, fn) {
        QueryBuilder.macro(name, fn);
        return this;
    }

    // Enterprise Subsystems

    get bulk() {
        return new BulkOperations(this);
    }

    get paginator() {
        return new CursorPagination(this);
    }

    get explainEngine() {
        return new ExplainEngine(this);
    }

    // Bulk Operations API Delegation

    insertMany(records, chunkSize = 500) {
        return this.bulk.insertMany(records, chunkSize);
    }

    insertIgnore(records, chunkSize = 500) {
        return this.bulk.insertIgnore(records, chunkSize);
    }

    replace(records, chunkSize = 500) {
        return this.bulk.replace(records, chunkSize);
    }

    updateMany(records, keyColumn = "id", chunkSize = 500) {
        return this.bulk.updateMany(records, keyColumn, chunkSize);
    }

    upsert(records, uniqueKeys = ["id"], updateColumns = null, chunkSize = 500) {
        return this.bulk.upsert(records, uniqueKeys, updateColumns, chunkSize);
    }

    sync(records, keyColumn = "id") {
        return this.bulk.sync(records, keyColumn);
    }

    deleteMany(idsArray, chunkSize = 500) {
        return this.bulk.deleteMany(idsArray, chunkSize);
    }

    chunkInsert(records, chunkSize, callback) {
        return this.bulk.chunkInsert(records, chunkSize, callback);
    }

    chunkUpdate(criteria, values, chunkSize = 500) {
        return this.bulk.chunkUpdate(criteria, values, chunkSize);
    }

    // Cursor Pagination & Streaming API Delegation

    paginate(perPage = 15, page = 1) {
        return this.paginator.paginate(perPage, page);
    }

    cursorPaginate(perPage = 15, cursor = null, cursorColumn = "id") {
        return this.paginator.cursorPaginate(perPage, cursor, cursorColumn);
    }

    cursor(cursorColumn = "id") {
        return this.paginator.cursor(cursorColumn);
    }

    lazy(chunkSize = 100, cursorColumn = "id") {
        return this.paginator.lazy(chunkSize, cursorColumn);
    }

    stream(chunkSize = 100, cursorColumn = "id") {
        return this.paginator.stream(chunkSize, cursorColumn);
    }

    each(callback, chunkSize = 100, cursorColumn = "id") {
        return this.paginator.each(callback, chunkSize, cursorColumn);
    }

    chunk(chunkSize, callback, cursorColumn = "id") {
        return this.paginator.chunk(chunkSize, callback, cursorColumn);
    }

    // EXPLAIN Engine API Delegation

    explain() {
        return this.explainEngine.explain();
    }

    explainAnalyze() {
        return this.explainEngine.explainAnalyze();
    }

    explainJson() {
        return this.explainEngine.explainJson();
    }

    explainWithSuggestions() {
        return this.explainEngine.explainWithSuggestions();
    }

    // Cache Builder Methods

    cache(options = {}) {
        const copy = this.clone();
        if (typeof options === "number") {
            copy._cacheOptions = { ttl: options, store: null, tags: [] };
        } else {
            copy._cacheOptions = {
                ttl: options.ttl || 60,
                store: options.store || null,
                tags: Array.isArray(options.tags) ? options.tags : [],
                key: options.key || null
            };
        }
        return copy;
    }

    async remember(key, ttlSeconds, callback) {
        const copy = this.cache({ key, ttl: ttlSeconds });
        return copy.get();
    }

    async rememberForever(key, callback) {
        return this.remember(key, null, callback);
    }

    toCacheKey() {
        const { sql, bindings } = this.toSql();
        const payload = JSON.stringify({ sql, bindings });
        let hash = 0;
        for (let i = 0; i < payload.length; i++) {
            hash = ((hash << 5) - hash) + payload.charCodeAt(i);
            hash |= 0;
        }
        return `qb_${Math.abs(hash).toString(36)}`;
    }

    // Immutable Cloning

    clone() {
        const copy = new QueryBuilder(this._connection, this._grammar);
        copy._modelRepository = this._modelRepository;
        copy._pendingScopes = this._pendingScopes ? [...this._pendingScopes] : [];
        copy._removedScopes = new Set(this._removedScopes || []);
        copy._scopeState = new Map(this._scopeState || []);
        copy._scopesApplied = this._scopesApplied || false;
        copy._removeAllGlobalScopes = this._removeAllGlobalScopes || false;
        copy._cacheOptions = this._cacheOptions ? { ...this._cacheOptions } : null;
        copy._ast = {
            table: this._ast.table,
            columns: [...this._ast.columns],
            wheres: [...this._ast.wheres],
            orders: [...this._ast.orders],
            groups: [...(this._ast.groups || [])],
            joins: [...this._ast.joins],
            limit: this._ast.limit,
            offset: this._ast.offset,
            aggregate: this._ast.aggregate ? { ...this._ast.aggregate } : null,
            eagerLoads: [...this._ast.eagerLoads],
            withCounts: [...this._ast.withCounts],
            withExists: [...this._ast.withExists],
            withAggregates: [...this._ast.withAggregates],
            profiles: [...this._ast.profiles],
            isDebug: this._ast.isDebug
        };
        return copy;
    }

    // Global & Local Scope Engine

    get scopeState() {
        return new Map(this._scopeState);
    }

    withoutGlobalScope(name) {
        const copy = this.clone();
        copy._removedScopes.add(name);
        return copy;
    }

    withoutGlobalScopes(names = null) {
        const copy = this.clone();
        if (Array.isArray(names)) {
            for (const n of names) {
                copy._removedScopes.add(n);
            }
        } else {
            if (copy._pendingScopes) {
                for (const s of copy._pendingScopes) {
                    if (s.name) copy._removedScopes.add(s.name);
                }
            }
            copy._removeAllGlobalScopes = true;
        }
        return copy;
    }

    applyScopes() {
        if (this._scopesApplied) {
            return this;
        }

        const copy = this.clone();
        copy._scopesApplied = true;

        if (!copy._pendingScopes || copy._pendingScopes.length === 0) {
            return copy;
        }

        const sortedScopes = [...copy._pendingScopes].sort(
            (a, b) => (a.priority ?? 10) - (b.priority ?? 10)
        );

        let activeBuilder = copy;

        for (const scopeObj of sortedScopes) {
            const name = scopeObj.name || "anonymous";

            if (activeBuilder._removedScopes.has(name) || activeBuilder._removeAllGlobalScopes) {
                activeBuilder._scopeState.set(name, "Removed");
                if (typeof scopeObj.remove === "function") {
                    scopeObj.remove(activeBuilder);
                }
                if (activeBuilder._modelRepository) {
                    PluginManager.dispatchSync(activeBuilder._modelRepository.modelClass, "scopeRemoved", {
                        scope: name,
                        builder: activeBuilder
                    });
                }
                continue;
            }

            if (typeof scopeObj.when === "function") {
                const condition = scopeObj.when(activeBuilder);
                if (!condition) {
                    activeBuilder._scopeState.set(name, "Skipped");
                    if (activeBuilder._modelRepository) {
                        PluginManager.dispatchSync(activeBuilder._modelRepository.modelClass, "scopeSkipped", {
                            scope: name,
                            builder: activeBuilder
                        });
                    }
                    continue;
                }
            }

            if (activeBuilder._modelRepository) {
                PluginManager.dispatchSync(activeBuilder._modelRepository.modelClass, "scopeApplying", {
                    scope: name,
                    builder: activeBuilder
                });
            }

            if (typeof scopeObj.apply === "function" || typeof scopeObj === "function") {
                const fn = typeof scopeObj.apply === "function" ? scopeObj.apply : scopeObj;

                let target = activeBuilder;
                const scopeProxy = new Proxy(activeBuilder, {
                    get(t, p, r) {
                        const val = Reflect.get(t, p, r);
                        if (typeof val === "function") {
                            return (...args) => {
                                const res = val.apply(t, args);
                                if (res instanceof QueryBuilder) {
                                    target._ast = res._ast;
                                    target._pendingScopes = res._pendingScopes;
                                    target._removedScopes = res._removedScopes;
                                    target._scopeState = res._scopeState;
                                    return scopeProxy;
                                }
                                return res;
                            };
                        }
                        return val;
                    }
                });

                const res = fn(scopeProxy);
                if (res instanceof QueryBuilder) {
                    activeBuilder._ast = res._ast;
                }
            }

            activeBuilder._scopeState.set(name, "Applied");

            if (activeBuilder._modelRepository) {
                PluginManager.dispatchSync(activeBuilder._modelRepository.modelClass, "scopeApplied", {
                    scope: name,
                    builder: activeBuilder
                });
            }
        }

        this._scopesApplied = true;
        this._scopeState = activeBuilder._scopeState;

        return activeBuilder;
    }

    groupBy(...columns) {
        const copy = this.clone();
        copy._ast.groups.push(...columns.flat());
        return copy;
    }

    from(table) {
        const copy = this.clone();
        copy._ast.table = table;
        return copy;
    }

    table(table) {
        return this.from(table);
    }

    select(...columns) {
        const copy = this.clone();
        const flat = columns.flat();
        copy._ast.columns = flat.length > 0 ? flat : [];
        return copy;
    }

    addSelect(...columns) {
        const copy = this.clone();
        copy._ast.columns.push(...columns.flat());
        return copy;
    }

    where(column, operator = null, value = null, boolean = "AND") {
        if (typeof column === "function") {
            const nestedBuilder = column(new QueryBuilder(this._connection, this._grammar));
            if (nestedBuilder && nestedBuilder._ast.wheres.length > 0) {
                const copy = this.clone();
                const nestedWheres = nestedBuilder._ast.wheres;
                const { sql, bindings } = this._grammar.compileWheres(nestedWheres);
                copy._ast.wheres.push(new WhereClause({
                    type: "raw",
                    column: `(${sql})`,
                    value: bindings,
                    boolean
                }));
                return copy;
            }
            return this;
        }

        if (value === null && (operator !== null || arguments.length <= 2)) {
            value = operator;
            operator = "=";
        }

        const copy = this.clone();
        copy._ast.wheres.push(new WhereClause({
            type: "basic",
            column,
            operator,
            value,
            boolean
        }));
        return copy;
    }

    orWhere(column, operator = null, value = null) {
        return this.where(column, operator, value, "OR");
    }

    whereIn(column, values, boolean = "AND", not = false) {
        const copy = this.clone();
        copy._ast.wheres.push(new WhereClause({
            type: "in",
            column,
            value: Array.isArray(values) ? values : [values],
            boolean,
            not
        }));
        return copy;
    }

    whereNotIn(column, values) {
        return this.whereIn(column, values, "AND", true);
    }

    whereNull(column, boolean = "AND", not = false) {
        const copy = this.clone();
        copy._ast.wheres.push(new WhereClause({
            type: "null",
            column,
            boolean,
            not
        }));
        return copy;
    }

    whereNotNull(column) {
        return this.whereNull(column, "AND", true);
    }

    whereBetween(column, range, boolean = "AND", not = false) {
        const copy = this.clone();
        copy._ast.wheres.push(new WhereClause({
            type: "between",
            column,
            value: range,
            boolean,
            not
        }));
        return copy;
    }

    whereRaw(sql, bindings = [], boolean = "AND") {
        const copy = this.clone();
        copy._ast.wheres.push(new WhereClause({
            type: "raw",
            column: isExpression(sql) ? sql : new Expression(sql),
            value: bindings,
            boolean
        }));
        return copy;
    }

    join(table, first, operator = "=", second = null, type = "INNER") {
        if (!second) {
            second = operator;
            operator = "=";
        }
        const copy = this.clone();
        copy._ast.joins.push(new JoinClause({ type, table, first, operator, second }));
        return copy;
    }

    leftJoin(table, first, operator = "=", second = null) {
        return this.join(table, first, operator, second, "LEFT");
    }

    rightJoin(table, first, operator = "=", second = null) {
        return this.join(table, first, operator, second, "RIGHT");
    }

    orderBy(column, direction = "ASC") {
        const copy = this.clone();
        copy._ast.orders.push(new OrderClause(column, direction));
        return copy;
    }

    limit(value) {
        const copy = this.clone();
        copy._ast.limit = Number(value);
        return copy;
    }

    offset(value) {
        const copy = this.clone();
        copy._ast.offset = Number(value);
        return copy;
    }

    toSql() {
        const compiled = this.applyScopes();
        return globalCompiledCache.getOrCompile(compiled._ast, compiled._grammar);
    }

    // Terminal Execution Methods

    async get() {
        if (this._modelRepository) {
            return this._modelRepository.get(this);
        }

        const compiled = this.applyScopes();
        const { sql, bindings } = compiled.toSql();

        return compiled._connection.select(sql, bindings);
    }

    async first() {
        const rows = await this.limit(1).get();
        return rows.length > 0 ? rows[0] : null;
    }

    async pluck(column) {
        const rows = await this.select(column).get();
        return rows.map(r => r[column]);
    }

    async exists() {
        const row = await this.first();
        return row !== null;
    }

    // Aggregates

    async count(column = "*") {
        const copy = this.applyScopes();
        copy._ast.aggregate = new AggregateClause("count", column);
        const { sql, bindings } = copy._grammar.compileSelect(copy._ast);
        const res = await copy._connection.query(sql, bindings);
        const firstRow = res.rows[0];
        return firstRow ? Number(Object.values(firstRow)[0]) : 0;
    }

    async max(column) {
        return this.runAggregate("max", column);
    }

    async min(column) {
        return this.runAggregate("min", column);
    }

    async avg(column) {
        return this.runAggregate("avg", column);
    }

    async sum(column) {
        return this.runAggregate("sum", column);
    }

    async runAggregate(type, column) {
        const copy = this.applyScopes();
        copy._ast.aggregate = new AggregateClause(type, column);
        const { sql, bindings } = copy._grammar.compileSelect(copy._ast);
        const res = await copy._connection.query(sql, bindings);
        const firstRow = res.rows[0];
        const val = firstRow ? Object.values(firstRow)[0] : null;
        return val !== null && val !== undefined ? Number(val) : null;
    }

    // Data Modifications

    async insert(values) {
        const { sql, bindings } = this._grammar.compileInsert(this._ast, values);
        return this._connection.insert(sql, bindings);
    }

    async insertGetId(values) {
        const res = await this.insert(values);
        return res.insertId;
    }

    async update(values) {
        const q = this.applyScopes();
        const { sql, bindings } = q._grammar.compileUpdate(q._ast, values);
        const res = await q._connection.update(sql, bindings);
        return res.affectedRows;
    }

    async delete() {
        const q = this.applyScopes();
        const { sql, bindings } = q._grammar.compileDelete(q._ast);
        const res = await q._connection.delete(sql, bindings);
        return res.affectedRows;
    }

    async truncate() {
        const { sql, bindings } = this._grammar.compileTruncate(this._ast);
        return this._connection.query(sql, bindings);
    }

    // Query Intelligence & Eager Loading Mutators

    with(...relations) {
        const copy = this.clone();
        for (const rel of relations) {
            if (Array.isArray(rel)) {
                copy._ast.eagerLoads.push(...rel);
            } else {
                copy._ast.eagerLoads.push(rel);
            }
        }
        return copy;
    }

    withCount(...relations) {
        const copy = this.clone();
        copy._ast.withCounts.push(...relations.flat());
        return copy;
    }

    withExists(...relations) {
        const copy = this.clone();
        copy._ast.withExists.push(...relations.flat());
        return copy;
    }

    withSum(relation, column, alias = null) {
        const copy = this.clone();
        copy._ast.withAggregates.push({ relation, column, type: "sum", alias });
        return copy;
    }

    withAvg(relation, column, alias = null) {
        const copy = this.clone();
        copy._ast.withAggregates.push({ relation, column, type: "avg", alias });
        return copy;
    }

    withMin(relation, column, alias = null) {
        const copy = this.clone();
        copy._ast.withAggregates.push({ relation, column, type: "min", alias });
        return copy;
    }

    withMax(relation, column, alias = null) {
        const copy = this.clone();
        copy._ast.withAggregates.push({ relation, column, type: "max", alias });
        return copy;
    }

    profile(...profileNames) {
        const copy = this.clone();
        copy._ast.profiles.push(...profileNames.flat());
        return copy;
    }

    debug() {
        const copy = this.clone();
        copy._ast.isDebug = true;
        return copy;
    }
}
