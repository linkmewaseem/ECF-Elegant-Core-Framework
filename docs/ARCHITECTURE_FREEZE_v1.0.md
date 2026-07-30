# ECF Framework — Architecture Freeze Declaration v1.0

This document serves as the official **Architecture Freeze Declaration v1.0** for the ECF (Enterprise Core Framework) database and core packages (`@ecf/core` and `@ecf/database`).

The core architecture, API contracts, public method signatures, and extension points defined below are locked. Future additions must maintain strict backward compatibility.

---

## 🏛️ Locked API Contracts & Component Specification

### 1. Core Container & Service Provider Engine (`@ecf/core`)
- **Application Lifecycle**: `register()`, `boot()`, `make()`, `instance()`, `bind()`, `singleton()`.
- **Facade System**: `Facade.setApplication()`, `DB`, `Schema` dynamic static delegator proxies.

### 2. Connection & Driver Layer (`@ecf/database`)
- **Connection API**: `select()`, `insert()`, `update()`, `delete()`, `statement()`, `transaction()`, `beginTransaction()`, `commit()`, `rollback()`.
- **Drivers**: SQLite, MySQL, PostgreSQL driver abstractions with identifier quoting and grammar compilers.

### 3. QueryBuilder & AST Engine (`@ecf/database`)
- **AST Immutability**: All builder mutators (`where`, `join`, `orderBy`, `select`, `limit`, `offset`, `with`, `profile`) return cloned instances.
- **Terminal Methods**: `get()`, `first()`, `pluck()`, `exists()`, `count()`, `sum()`, `avg()`, `min()`, `max()`, `insert()`, `update()`, `delete()`, `toSql()`.
- **Macro Registry**: `QueryBuilder.macro(name, fn)` for runtime query builder extensions.

### 4. Hybrid ORM & Model Repository (`@ecf/database`)
- **Active Record + Data Mapper Hybrid**: Dual access via `Model.save()`, `Model.delete()`, and `Model.repository()`.
- **Attribute Manager & Dirty Tracking**: `isDirty()`, `isClean()`, `getOriginal()`, `getChanges()`.
- **Casting & Serialization**: Built-in casts (`integer`, `float`, `boolean`, `json`, `date`, `datetime`), custom cast classes, `toJSON()`, `hidden`, `visible`, `appends`.
- **ModelCollection Engine**: Expressive collection API (`pluck`, `groupBy`, `keyBy`, `chunk`, `sortBy`, `partition`, `where`).

### 5. Relationship Engine & Query Intelligence (`@ecf/database`)
- **Relations**: `hasOne`, `hasMany`, `belongsTo`, `belongsToMany`.
- **Query Intelligence**: `IdentityMap` instance deduplication, `RelationPlan` eager loading (`with`), nested eager loading (`with('posts.comments')`), aggregate eager loading (`withCount`, `withExists`, `withSum`, `withAvg`, `withMin`, `withMax`), and Smart Profile composition (`@basic`).

### 6. Scope Intelligence Engine (`@ecf/database`)
- **Global Scopes**: `addGlobalScope(name/scopeObj, optionsOrPriority)`, `withoutGlobalScope(name)`, `withoutGlobalScopes()`. Non-destructive deferred evaluation (`applyScopes()`), priority sorting, and `when()` conditional evaluation.
- **Local Scopes**: Automatic scanning and caching of `scope<Name>` methods into `Model.meta.scopes`. Dual invocation on static Model calls (`User.admins()`) and chained query calls (`User.query().admins()`).

### 7. Model Event Bus & Observer System (`@ecf/database`)
- **Lifecycle Events**: 13 standard events (`retrieved`, `saving`, `saved`, `creating`, `created`, `updating`, `updated`, `deleting`, `deleted`, `restoring`, `restored`, `forceDeleting`, `forceDeleted`).
- **Cancelable Pre-Events**: Pre-events (`saving`, `creating`, `updating`, `deleting`) returning `false` halt the operation and abort DB mutation.
- **Transaction-Aware Post-Events**: Post-events (`created`, `updated`, `saved`, `deleted`) inside DB transactions are buffered until `TransactionCommitted`. If the transaction rolls back, post-events are discarded.
- **Observer Classes & Priority**: `User.observe(Observer, priority)` auto-wires methods with priority-based listener execution.
- **Wildcard Pattern Routing & EventContext**: Wildcard listeners (`*`, `created:*`) receiving structured `{ event, model, changes, original, connection, inTransaction, timestamp }`.

---

## 🔒 Guarantee of Backward Compatibility

Starting from v1.0:
1. No breaking signature changes to locked methods.
2. All new ORM or framework features (e.g. `SoftDeletes`, `MultiTenant`, `@ecf/http`, `@ecf/router`, `@ecf/view`, `@ecf/validation`) must build on top of these locked core interfaces.
