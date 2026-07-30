# Production Database Engine Architecture Freeze Declaration v1.0

This document serves as the official **Production Database Engine Architecture Freeze Declaration v1.0** for the ECF (Enterprise Core Framework) database package (`@ecf/database`).

All architectural subsystems, public API signatures, performance strategies, cache layers, benchmark standards, internal interfaces, and backward compatibility contracts locked below are permanent.

---

## 🏗️ Release Structure: Milestone 8.1 & Milestone 8.2

Milestone 8 is divided into two distinct, stable release milestones:
1. **Milestone 8.1 — Performance Infrastructure**: Core query caching, prepared statement caching, compiled AST caching, grammar compiler abstraction, lifecycle event streams, profiler, and telemetry metrics.
2. **Milestone 8.2 — Developer APIs & Optimizations**: Bulk operations engine, cursor pagination & streaming suite, multi-format EXPLAIN engine, hydrator pipeline, relation caching, and performance benchmarks.

---

## 🏛️ Abstract SQL Compiler Pipeline & Internal Interfaces (`packages/database/src/contracts/`)

### Abstract SQL Compiler Architecture
The QueryBuilder is 100% database-agnostic. Query execution strictly adheres to the 5-stage compiler pipeline:

$$\text{QueryBuilder} \longrightarrow \text{AST} \longrightarrow \text{Grammar (IGrammar)} \longrightarrow \text{Compiler (IGrammarCompiler)} \longrightarrow \text{Driver Connection}$$

All dialect-specific syntax (identifier quoting, positional parameter placeholders `$1` vs `?`, UPSERT dialect clauses, EXPLAIN formats, JSON extraction) are encapsulated inside Grammar Compilers (`SQLiteGrammar`, `MySQLGrammar`, `PostgresGrammar`, `MSSQLGrammar`).

### Locked Abstract Interfaces:
- **`IGrammar` / `IGrammarCompiler`**: Abstract SQL AST compiler contract (`compileSelect`, `compileInsert`, `compileUpdate`, `compileDelete`, `compileExplain`, `compileBulkInsert`, `compileUpsert`).
- **`IQueryCache`**: API contract for query builder caching & tag invalidation.
- **`ICacheStore`**: Pluggable storage adapter interface (`get`, `set`, `forget`, `flush`, `flushTags`).
- **`IHydrator`**: Pipeline contract for raw row transformation (`hydrate`, `hydrateRaw`).
- **`IProfiler`**: Query lifecycle telemetry and trace event publisher.
- **`IMetrics`**: Categorized counters and health diagnostics provider.
- **`IBulkExecutor`**: Dialect-specific high-throughput batch operations contract.
- **`ICursorPaginator`**: Cursor pagination, lazy generators, and streams handler.
- **`IExplainEngine`**: Multi-format query execution plan analyzer.

---

## 🚀 Milestone 8.1 — Performance Infrastructure

### 1. Grammar Compiler Abstraction (`IGrammar.js`, `GrammarCompiler.js`)
- **Agnostic AST Compilation**: QueryBuilder delegates AST compilation to `IGrammarCompiler`.
- **Dialect Grammars**:
  - `SQLiteGrammar`: Quoting `"col"`, positional `?`, `INSERT OR REPLACE`, `EXPLAIN QUERY PLAN`.
  - `MySQLGrammar`: Quoting `` `col` ``, positional `?`, `ON DUPLICATE KEY UPDATE`, `EXPLAIN FORMAT=JSON`.
  - `PostgresGrammar`: Quoting `"col"`, positional `$1, $2`, `ON CONFLICT (...) DO UPDATE`, `EXPLAIN (ANALYZE, FORMAT JSON)`.
  - `MSSQLGrammar`: Quoting `[col]`, positional `@p1`, `MERGE` statement upserts, `TOP / OFFSET FETCH`.

### 2. Decoupled Query Cache (`QueryCache.js`, `ICacheStore.js`)
- **Abstract Driver Architecture**: Query Cache is fully decoupled from the ORM core via `ICacheStore`. Supports `MemoryCacheStore` (default), `RedisCacheStore`, `FileCacheStore`, and `CustomCacheStore`.
- **API Signatures**:
  ```javascript
  User.query().cache({ ttl: 60, store: "redis", tags: ["users"] }).get();
  User.query().remember('active_users', 60, callback);
  User.query().rememberForever('app_settings', callback);
  DB.cacheStore('redis').flushTags(['users']);
  ```
- **Tag Invalidation**: Automatic purging of tag-associated query caches upon model mutations (`created`, `updated`, `deleted`).

### 3. Multi-Driver Compiled SQL Cache Engine (`CompiledSqlCache.js`)
- **AST to Driver SQL Cache Pipeline**:
  $$\text{AST Fingerprint} \longrightarrow \text{Compiled SQL Template} \longrightarrow \text{Parameter Order Mapping} \longrightarrow \text{Driver Specific SQL}$$
- **Multi-Driver Reuse**: A single QueryBuilder AST produces driver-specific cached SQL templates for MySQL, PostgreSQL, SQLite, and MSSQL without re-compiling clause trees on consecutive runs.

### 4. Connection-Level Prepared Statement Cache (`PreparedStatementCache.js`)
- **Architectural Scope**: Managed at the **`Connection` level** (NOT the QueryBuilder level).
- **Statement Handle Reuse**: Independent QueryBuilder instances sharing the same SQL structure share the underlying pooled prepared statement handle on the active connection, maximizing database engine throughput.

### 5. Query Profiler & Lifecycle Event Stream (`QueryProfiler.js`, `QueryEventStream.js`)
- **5-Stage Query Lifecycle Event Stream**:
  $$\text{Query Started} \longrightarrow \text{Compiled} \longrightarrow \text{Executing} \longrightarrow \text{Executed} \longrightarrow \text{Hydrated}$$
- **DevTools Integration**: Emits rich telemetry events with stack trace information (`file`, `line`, `class`, `method`), memory delta, row count, execution time (ms), and connection name.

### 6. Categorized Metrics Engine (`QueryMetrics.js`, `IMetrics.js`)
- **Categorized Diagnostics**: Tracks real-time counters across 6 isolated channels:
  1. `Queries`: Total, duplicate, slow query warnings.
  2. `Cache`: Hits, misses, store latency.
  3. `Hydration`: Hydration count, pipeline duration.
  4. `Relations`: Eager loading cache hit rates.
  5. `Extensions`: Plugin execution overhead.
  6. `Drivers`: Connection pool usage, statement execution stats.
- **Diagnostic API**: `DB.getMetrics(category = null)` and `DB.resetMetrics()`.

---

## 🚀 Milestone 8.2 — Developer APIs & Optimizations

### 1. Enterprise Bulk Operations Engine (`BulkOperations.js`, `IBulkExecutor.js`)
- **Extended API Methods**:
  ```javascript
  User.query().insertMany(records, chunkSize = 500);
  User.query().insertIgnore(records, chunkSize = 500);
  User.query().replace(records, chunkSize = 500);
  User.query().updateMany(records, keyColumn = 'id', chunkSize = 500);
  User.query().upsert(records, uniqueKeys, updateColumns, chunkSize = 500);
  User.query().sync(records, keyColumn = 'id');
  User.query().deleteMany(idsArray, chunkSize = 500);
  User.query().chunkInsert(records, chunkSize, async (chunk) => {});
  User.query().chunkUpdate(criteria, values, chunkSize);
  ```

### 2. Cursor Pagination & Data Streaming Suite (`CursorPagination.js`, `ICursorPaginator.js`)
- **Complete Iteration APIs**:
  ```javascript
  User.query().paginate(perPage = 15, page = 1);
  User.query().cursorPaginate(perPage = 15, cursor = null, cursorColumn = 'id');
  User.query().cursor();                 // Cursor generator yielding rows
  User.query().lazy(chunkSize = 100);    // AsyncIterable generator yielding models
  User.query().stream();                 // Node/Web ReadableStream interface
  User.query().each(async (model) => {});// Iterates 1 model at a time with low memory
  User.query().chunk(100, async (models) => {}); // Chunks processing
  ```

### 3. Multi-Format EXPLAIN & Index Advisor Engine (`ExplainEngine.js`, `IExplainEngine.js`)
- **Multi-Format Execution Plan Methods**:
  ```javascript
  await User.query().explain();                 // Standard text plan
  await User.query().explainAnalyze();          // Execution cost & timing plan
  await User.query().explainJson();             // Formatted JSON execution plan
  await User.query().explainWithSuggestions(); // Index recommendation advisory
  ```

### 4. Hydration Pipeline Architecture (`Hydrator.js`, `IHydrator.js`)
- **6-Stage Hydration Pipeline**:
  $$\text{Raw Rows} \longrightarrow \text{Cast Attributes} \longrightarrow \text{Apply Mutators} \longrightarrow \text{Attach Relations} \longrightarrow \text{Wrap Proxy} \longrightarrow \text{Ready Model}$$
- **Hydration Fast-Path**: Bypasses `Object.defineProperty` overhead per row for bulk operations via pre-computed property descriptor prototypes (`hydrateRaw()`).

### 5. In-Memory Relation Cache (`RelationCache.js`)
- **Model-Instance Scope**: Isolated in-memory relation cache preventing duplicate relational loads (`User` $\rightarrow$ `posts` $\rightarrow$ `comments`) within request contexts without polluting external Redis caches.

### 6. Fair Performance Benchmark Methodology (`BenchmarkRunner.js`)
- **Reproducible Methodology**: Standardized, fair benchmark suite measuring:
  - `Baseline`: Raw SQL Driver execution.
  - `Optimized`: ECF Compiled + Prepared Statement Cache.
  - `Cached`: Query & Relation Cache.
  - `Hydrated`: Raw Hydration Pipeline vs Full Proxy Model.
  - `Bulk`: Single INSERTs vs Chunked Bulk Operations.
  - `Streaming`: Offset Pagination vs Cursor/Stream.
- Results are published transparently to `docs/BENCHMARK_REPORT.md`.

---

## 🔒 Guarantee of Backward Compatibility & Package Stability

Starting from v1.0 Release of `@ecf/database`:
1. All public interfaces (`IGrammar`, `IQueryCache`, `ICacheStore`, `IHydrator`, `IProfiler`, `IMetrics`, `IBulkExecutor`, `ICursorPaginator`, `IExplainEngine`) are permanently locked.
2. The Database package transition to **v1.0 Stable (Architecture Locked)** takes effect immediately upon completion of Milestone 8.2.
3. Future updates to `@ecf/database` are strictly limited to bug fixes, performance optimizations, security patches, and new database drivers.
