# `@ecfjs/database`

> **Enterprise Database Engine, Immutable Query Builder, Schema DDL Compiler, Migrations & Active Record ORM for ECF (Elegant Core Framework).**

[![Version](https://img.shields.io/badge/version-1.0.0--rc.1-blue.svg)](https://github.com/linkmewaseem/ECF-Elegant-Core-Framework)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](https://nodejs.org)

---

## Executive Summary

`@ecfjs/database` is the enterprise data access tier of the ECF framework. It provides:
1. **Multi-Driver Database Manager**: Unified database connection pooling supporting SQLite, MySQL, and PostgreSQL drivers.
2. **Immutable Query Builder**: Chainable AST query generator featuring $O(K)$ Trie compilation, macro extensions, and tagged query caching (`QueryCache`).
3. **Enterprise Bulk & Streaming Engines**: High-throughput batch operations (`insertMany`, `updateMany`, `upsert`), memory-efficient `CursorPagination`, and `ExplainEngine` index advisors.
4. **Schema DDL Compiler & Blueprint**: Cross-dialect DDL migrations engine (`SQLiteSchemaGrammar`, `MySQLSchemaGrammar`, `PostgreSQLSchemaGrammar`).
5. **Active Record & Data Mapper ORM (`Model`)**: ES6 Proxy model hydration, dirty property tracking (`isDirty`, `getChanges`), attribute mutators, cast managers, and serialization guards.
6. **Advanced Relationship Engine**: Lazy/Eager loading (`with`, `withCount`, `withSum`), relation constraints, nested eager loading, and cache invalidation.
7. **Scopes, Events & Observers**: Global/Local scopes, model event hooks (`saving`, `saved`, `deleting`), observer classes, and transaction-deferred event firing.
8. **Telemetry & Performance**: Built-in `QueryProfiler`, 5-stage lifecycle event streams (`QueryEventStream`), metrics tracking, and statement handle pooling (`PreparedStatementCache`).

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [1. Connection & Driver Infrastructure](#1-connection--driver-infrastructure)
  - [1.1 DatabaseManager & Multi-Connection Configuration](#11-databasemanager--multi-connection-configuration)
  - [1.2 Raw Queries & Prepared Statements](#12-raw-queries--prepared-statements)
  - [1.3 Database Transactions & Safe Nesting](#13-database-transactions--safe-nesting)
  - [1.4 Database Drivers (SQLite, MySQL, PostgreSQL)](#14-database-drivers-sqlite-mysql-postgresql)
- [2. Immutable Query Builder (`QueryBuilder`)](#2-immutable-query-builder-querybuilder)
  - [2.1 Immutable AST & Cloning Mechanics](#21-immutable-ast--cloning-mechanics)
  - [2.2 Selects, Distinct & Raw Expressions](#22-selects-distinct--raw-expressions)
  - [2.3 Complete Filtering Clauses (`where`, `whereIn`, `whereNull`, `whereBetween`, `whereExists`)](#23-complete-filtering-clauses-where-wherein-wherenull-wherebetween-whereexists)
  - [2.4 Joins & Grouping (`join`, `groupBy`, `having`)](#24-joins--grouping-join-groupby-having)
  - [2.5 Ordering & Pagination (`orderBy`, `limit`, `offset`, `paginate`)](#25-ordering--pagination-orderby-limit-offset-paginate)
  - [2.6 Aggregates (`count`, `sum`, `avg`, `min`, `max`)](#26-aggregates-count-sum-avg-min-max)
  - [2.7 Macro Extensions (`QueryBuilder.macro`)](#27-macro-extensions-querybuildermacro)
- [3. Enterprise Query & Performance Capabilities](#3-enterprise-query--performance-capabilities)
  - [3.1 Bulk Operations (`BulkOperations`)](#31-bulk-operations-bulkoperations)
  - [3.2 Cursor-Based Pagination (`CursorPagination`)](#32-cursor-based-pagination-cursorpagination)
  - [3.3 Explain Engine & Index Advisor (`ExplainEngine`)](#33-explain-engine--index-advisor-explainengine)
  - [3.4 Tagged Result Caching (`QueryCache`)](#34-tagged-result-caching-querycache)
  - [3.5 Compiled SQL & PreparedStatement Cache](#35-compiled-sql--preparedstatement-cache)
  - [3.6 Telemetry Metrics & Profiler (`QueryProfiler`)](#36-telemetry-metrics--profiler-queryprofiler)
- [4. Schema Builder & DDL Compilers (`Schema`)](#4-schema-builder--ddl-compilers-schema)
  - [4.1 Creating & Altering Tables (`Schema.create`, `Schema.table`)](#41-creating--altering-tables-schemacreate-schematable)
  - [4.2 Blueprint Column Definitions](#42-blueprint-column-definitions)
  - [4.3 Indexes & Foreign Key Constraints](#43-indexes--foreign-key-constraints)
  - [4.4 Cross-Dialect Schema Grammars](#44-cross-dialect-schema-grammars)
- [5. Database Migrations Engine](#5-database-migrations-engine)
  - [5.1 Authoring Migration Classes](#51-authoring-migration-classes)
  - [5.2 Migration Execution (`Migrator`)](#52-migration-execution-migrator)
- [6. ORM & Active Record Layer (`Model`)](#6-orm--active-record-layer-model)
  - [6.1 Defining Models & ES6 Proxy Mechanics](#61-defining-models--es6-proxy-mechanics)
  - [6.2 Active Record vs Data Mapper Repository Pattern](#62-active-record-vs-data-mapper-repository-pattern)
  - [6.3 Mass Assignment Protection (`fillable`, `guarded`)](#63-mass-assignment-protection-fillable-guarded)
  - [6.4 Dirty Property Tracking (`isDirty`, `getChanges`)](#64-dirty-property-tracking-isdirty-getchanges)
  - [6.5 Attribute Mutators, Accessors & Casts](#65-attribute-mutators-accessors--casts)
  - [6.6 Model Collections (`ModelCollection`)](#66-model-collections-modelcollection)
- [7. Relationship Engine](#7-relationship-engine)
  - [7.1 `hasOne` & `belongsTo`](#71-hasone--belongsto)
  - [7.2 `hasMany` & `belongsToMany` (Pivot Tables)](#72-hasmany--belongstomany-pivot-tables)
  - [7.3 Eager Loading & N+1 Prevention (`with`)](#73-eager-loading--n1-prevention-with)
  - [7.4 Relationship Aggregates (`withCount`, `withSum`, `withExists`)](#74-relationship-aggregates-withcount-withsum-withexists)
- [8. Scopes, Events & Observers](#8-scopes-events--observers)
  - [8.1 Global & Local Scopes](#81-global--local-scopes)
  - [8.2 Model Lifecycle Events](#82-model-lifecycle-events)
  - [8.3 Observer Classes](#83-observer-classes)
- [9. Typed Database Exceptions](#9-typed-database-exceptions)
- [10. Complete End-to-End Practical Example](#10-complete-end-to-end-practical-example)
- [11. Troubleshooting & Best Practices](#11-troubleshooting--best-practices)

---

## Installation

```bash
pnpm add @ecfjs/database @ecfjs/core
# or
npm install @ecfjs/database @ecfjs/core
```

---

## Quick Start

```javascript
import { Application, Facade } from "@ecfjs/core";
import { DatabaseServiceProvider, DB, Schema, Model } from "@ecfjs/database";

// 1. Bootstrap ECF Application Container
const app = new Application();
app.register(DatabaseServiceProvider);

app.configure({
    database: {
        default: "sqlite",
        connections: {
            sqlite: {
                driver: "sqlite",
                database: ":memory:"
            }
        }
    }
});

app.boot();
Facade.setApplication(app);

// 2. Build Schema Table using Schema Facade
await Schema.create("users", (table) => {
    table.id();
    table.string("name");
    table.string("email").unique();
    table.timestamps();
});

// 3. Define Model
class User extends Model {
    static table = "users";
    static fillable = ["name", "email"];
}

// 4. Create Record via Active Record
const user = await User.create({ name: "Alice", email: "alice@example.com" });
console.log(`Created user #${user.id}: ${user.name}`);

// 5. Query using DB QueryBuilder
const found = await DB.table("users").where("email", "alice@example.com").first();
console.log("Found User via QueryBuilder:", found);
```

---

## Architecture Overview

```
+-------------------------------------------------------------------------+
|                               DB Facade                                 |
+-------------------------------------------------------------------------+
                                     │
                                     ▼
+-------------------------------------------------------------------------+
|                             DatabaseManager                             |
|  +-------------------------------------------------------------------+  |
|  |                         ConnectionManager                         |  |
|  |  +---------------------+  +-----------------+  +---------------+  |  |
|  |  |    SQLiteDriver     |  |   MySQLDriver   |  | PostgreSQL... |  |  |
|  |  +---------------------+  +-----------------+  +---------------+  |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
        │                                                     │
        ▼                                                     ▼
+-----------------------+                             +-------------------+
|     QueryBuilder      |                             |   SchemaBuilder   |
| (AST, Caching, Specs) |                             |  (Blueprint, DDL) |
+-----------------------+                             +-------------------+
        │                                                     │
        ▼                                                     ▼
+-------------------------------------------------------------------------+
|                               ORM Model                                 |
| (Hydrator, Active Record, Relations, Casts, Scopes, Observers, Plugins) |
+-------------------------------------------------------------------------+
```

---

## 1. Connection & Driver Infrastructure

### 1.1 DatabaseManager & Multi-Connection Configuration

`DatabaseManager` (`src/DatabaseManager.js`) manages multiple database connection pools concurrently:

```javascript
import { DatabaseManager } from "@ecfjs/database";

const db = new DatabaseManager({
    default: "mysql",
    connections: {
        mysql: {
            driver: "mysql",
            host: "127.0.0.1",
            user: "root",
            password: "secret",
            database: "production_db"
        },
        pg: {
            driver: "postgres",
            host: "127.0.0.1",
            user: "postgres",
            database: "analytics_db"
        }
    }
});

// Access default connection
const defaultConn = db.connection();

// Access specific connection
const analyticsConn = db.connection("pg");
```

### 1.2 Raw Queries & Prepared Statements

Execute SQL statements directly against active connections:

```javascript
// Parameterized SELECT query
const users = await DB.select("SELECT * FROM users WHERE status = ?", ["active"]);

// Statement execution (INSERT / UPDATE / DELETE)
const result = await DB.statement("UPDATE users SET status = ? WHERE id = ?", ["inactive", 42]);

// Raw unescaped query execution
await DB.raw("OPTIMIZE TABLE users");
```

### 1.3 Database Transactions & Safe Nesting

`Connection` handles safe database transaction boundaries with automatic commit/rollback:

```javascript
// Method 1: Automatic transaction block with closure
await DB.transaction(async (conn) => {
    await conn.statement("UPDATE accounts SET balance = balance - 100 WHERE id = 1");
    await conn.statement("UPDATE accounts SET balance = balance + 100 WHERE id = 2");
});

// Method 2: Manual transaction control
try {
    await DB.beginTransaction();
    await DB.statement("DELETE FROM logs WHERE created_at < ?", [cutoffDate]);
    await DB.commit();
} catch (error) {
    await DB.rollback();
    throw error;
}
```

### 1.4 Database Drivers (SQLite, MySQL, PostgreSQL)

- `SQLiteDriver`: In-memory (`:memory:`) or disk-based SQLite execution.
- `MySQLDriver`: Native MySQL parameter binding (`?`) with backtick quoting.
- `PostgreSQLDriver`: Native PostgreSQL parameter positional binding (`$1`, `$2`) with double-quote identifier escaping.

---

## 2. Immutable Query Builder (`QueryBuilder`)

`QueryBuilder` (`src/query/QueryBuilder.js`) features an immutable Abstract Syntax Tree (AST) engine. Modifying query state returns a clone of the builder.

### 2.1 Immutable AST & Cloning Mechanics

```javascript
const baseQuery = DB.table("users").where("status", "active");

// Cloning guarantees baseQuery remains unmodified
const queryA = baseQuery.where("role", "admin");
const queryB = baseQuery.where("role", "user");
```

### 2.2 Selects, Distinct & Raw Expressions

```javascript
import { Expression } from "@ecfjs/database";

const users = await DB.table("users")
    .select("id", "name")
    .addSelect(new Expression("COUNT(posts.id) as posts_count"))
    .distinct()
    .get();
```

### 2.3 Complete Filtering Clauses (`where`, `whereIn`, `whereNull`, `whereBetween`, `whereExists`)

```javascript
const results = await DB.table("users")
    .where("age", ">=", 18)
    .orWhere("status", "pending")
    .whereIn("role", ["admin", "editor"])
    .whereNotIn("department_id", [5, 6])
    .whereNull("deleted_at")
    .whereNotNull("email_verified_at")
    .whereBetween("created_at", ["2026-01-01", "2026-12-31"])
    .whereExists(query => {
        query.select("1").from("orders").whereColumn("orders.user_id", "users.id");
    })
    .get();
```

### 2.4 Joins & Grouping (`join`, `groupBy`, `having`)

```javascript
const report = await DB.table("orders")
    .join("users", "users.id", "=", "orders.user_id")
    .leftJoin("discounts", "discounts.id", "=", "orders.discount_id")
    .select("users.name", DB.raw("SUM(orders.total) as total_spent"))
    .groupBy("users.id", "users.name")
    .having("total_spent", ">", 1000)
    .get();
```

### 2.5 Ordering & Pagination (`orderBy`, `limit`, `offset`, `paginate`)

```javascript
// Standard Ordering & Limits
const topUsers = await DB.table("users")
    .orderBy("created_at", "desc")
    .limit(10)
    .offset(20)
    .get();

// Standard Offset/Limit Pagination
const pageData = await DB.table("users").paginate(15, 1);
// Returns: { data: [...], total: 100, perPage: 15, currentPage: 1, lastPage: 7 }
```

### 2.6 Aggregates (`count`, `sum`, `avg`, `min`, `max`)

```javascript
const totalCount = await DB.table("users").count();
const maxBalance = await DB.table("accounts").max("balance");
const avgAge     = await DB.table("users").avg("age");
```

### 2.7 Macro Extensions (`QueryBuilder.macro`)

Extend `QueryBuilder` dynamically across your application:

```javascript
import { QueryBuilder } from "@ecfjs/database";

QueryBuilder.macro("whereActive", function() {
    return this.where("status", "active").whereNull("deleted_at");
});

// Usage anywhere in app:
const activeUsers = await DB.table("users").whereActive().get();
```

---

## 3. Enterprise Query & Performance Capabilities

### 3.1 Bulk Operations (`BulkOperations`)

Executes high-performance batch operations in a single database round-trip:

```javascript
import { BulkOperations } from "@ecfjs/database";

const bulk = new BulkOperations(connection);

// High-speed multi-row insert
await bulk.insertMany("users", [
    { name: "User 1", email: "u1@example.com" },
    { name: "User 2", email: "u2@example.com" }
]);

// Upsert (Insert or Update on conflict)
await bulk.upsert("users", [
    { id: 1, name: "Updated Name", email: "u1@example.com" }
], ["id"], ["name"]);
```

### 3.2 Cursor-Based Pagination (`CursorPagination`)

Memory-efficient cursor iteration over large datasets ($100k+$ rows) without SQL offset overhead:

```javascript
const paginator = await DB.table("logs")
    .orderBy("id", "asc")
    .cursorPaginate(50, currentCursorString);

console.log(paginator.data);       // Next 50 records
console.log(paginator.nextCursor); // Opaque cursor string for next page
```

### 3.3 Explain Engine & Index Advisor (`ExplainEngine`)

Analyze query performance and detect missing indexes:

```javascript
const analysis = await DB.table("orders")
    .where("status", "pending")
    .where("total", ">", 500)
    .explain();

console.log(analysis.queryPlan);
console.log(analysis.indexSuggestions); // Suggested composite indexes!
```

### 3.4 Tagged Result Caching (`QueryCache`)

Cache query results across `MemoryCacheStore`, `RedisCacheStore`, or `FileCacheStore`:

```javascript
const users = await DB.table("users")
    .where("role", "admin")
    .remember(3600, "admin_users_cache") // Cache for 1 hour
    .get();
```

### 3.5 Compiled SQL & PreparedStatement Cache

- `CompiledSqlCache`: Caches AST-to-SQL string generation yielding $\ge 99\%$ compilation hit rates.
- `PreparedStatementCache`: Pools prepared statement handles per connection pool.

### 3.6 Telemetry Metrics & Profiler (`QueryProfiler`)

Track query metrics across 6 isolated channels (`QueryMetrics`) and listen to 5-stage lifecycle event streams (`QueryEventStream`):

```javascript
import { QueryProfiler } from "@ecfjs/database";

QueryProfiler.enable();

QueryProfiler.on("query:executed", (event) => {
    console.log(`Executed: ${event.sql} in ${event.durationMs}ms`);
});
```

---

## 4. Schema Builder & DDL Compilers (`Schema`)

### 4.1 Creating & Altering Tables (`Schema.create`, `Schema.table`)

```javascript
import { Schema } from "@ecfjs/database";

// Create Table
await Schema.create("products", (table) => {
    table.id();
    table.string("sku", 64).unique();
    table.string("title");
    table.decimal("price", 10, 2);
    table.boolean("is_active").default(true);
    table.timestamps();
});

// Alter Table
await Schema.table("products", (table) => {
    table.string("barcode").nullable();
    table.index(["title", "is_active"]);
});

// Drop Table
await Schema.dropIfExists("products");
```

### 4.2 Blueprint Column Definitions

| Column Method | SQL Type Equivalent | Options |
|---|---|---|
| `table.id()` | BigInteger Primary Key Auto Increment | `primary()` |
| `table.string(name, length)` | VARCHAR(length) | `nullable()`, `default(val)` |
| `table.text(name)` | TEXT | `nullable()` |
| `table.integer(name)` | INT | `unsigned()` |
| `table.bigInteger(name)` | BIGINT | `unsigned()` |
| `table.boolean(name)` | BOOLEAN / TINYINT(1) | `default(true)` |
| `table.decimal(name, p, s)` | DECIMAL(p, s) | `default(0.00)` |
| `table.timestamps()` | `created_at`, `updated_at` | Timestamps |
| `table.json(name)` | JSON / TEXT | `nullable()` |

### 4.3 Indexes & Foreign Key Constraints

```javascript
await Schema.create("comments", (table) => {
    table.id();
    table.text("content");
    
    // Foreign key helper
    table.foreignId("post_id").constrained("posts").cascadeOnDelete();
    table.foreignId("user_id").constrained("users").onDelete("SET NULL");

    // Indexes
    table.index("post_id", "idx_comments_post");
    table.unique(["post_id", "user_id"]);
});
```

### 4.4 Cross-Dialect Schema Grammars

`SchemaBuilder` delegates DDL string compilation to dialect-specific grammars:
- `SQLiteSchemaGrammar`
- `MySQLSchemaGrammar`
- `PostgreSQLSchemaGrammar`

---

## 5. Database Migrations Engine

### 5.1 Authoring Migration Classes

```javascript
import { Migration, Schema } from "@ecfjs/database";

export default class CreateOrdersTable extends Migration {
    async up() {
        await Schema.create("orders", (table) => {
            table.id();
            table.foreignId("user_id").constrained();
            table.decimal("total", 10, 2);
            table.timestamps();
        });
    }

    async down() {
        await Schema.dropIfExists("orders");
    }
}
```

### 5.2 Migration Execution (`Migrator`)

```javascript
import { Migrator, MigrationRepository, MigrationLoader } from "@ecfjs/database";

const migrator = new Migrator(
    new MigrationRepository(connection),
    new MigrationLoader("./database/migrations"),
    connection
);

// Run outstanding migrations
await migrator.run();

// Rollback last migration batch
await migrator.rollback();

// Reset all migrations
await migrator.reset();
```

---

## 6. ORM & Active Record Layer (`Model`)

`Model` (`src/orm/Model.js`) is the base class for Active Record entities.

### 6.1 Defining Models & ES6 Proxy Mechanics

`Model` uses ES6 `Proxy` traps to intercept property accessors and mutators cleanly:

```javascript
import { Model } from "@ecfjs/database";

export class User extends Model {
    static table = "users";
    static primaryKey = "id";
    static fillable = ["name", "email", "age"];
}
```

### 6.2 Active Record vs Data Mapper Repository Pattern

Both patterns are fully supported side-by-side:

```javascript
// Active Record Style
const user = new User();
user.name = "Alice";
user.email = "alice@example.com";
await user.save();

user.name = "Alice Smith";
await user.save(); // Generates UPDATE

await user.delete(); // Generates DELETE

// Data Mapper Style via Repository
const repo = User.repository();
const fetchedUser = await repo.find(1);
await repo.save(fetchedUser);
```

### 6.3 Mass Assignment Protection (`fillable`, `guarded`)

```javascript
// Allowed fields
class Product extends Model {
    static fillable = ["title", "price"];
}

const product = new Product();
product.fill({ title: "Phone", price: 499, is_admin: true });
console.log(product.is_admin); // undefined (Protected!)

// Bypass mass assignment safety intentionally
product.forceFill({ is_admin: true });
```

### 6.4 Dirty Property Tracking (`isDirty`, `getChanges`)

```javascript
const user = await User.find(1);

user.name = "Updated Name";

console.log(user.isDirty());        // true
console.log(user.isDirty("name"));  // true
console.log(user.getOriginal("name")); // "Old Name"
console.log(user.getChanges());     // { name: "Updated Name" }
```

### 6.5 Attribute Mutators, Accessors & Casts

```javascript
import { Model } from "@ecfjs/database";

class User extends Model {
    static casts = {
        is_active: "boolean",
        metadata: "json",
        created_at: "datetime"
    };

    // Custom Accessor
    getNameAttribute(value) {
        return value.toUpperCase();
    }

    // Custom Mutator
    setEmailAttribute(value) {
        return value.toLowerCase().trim();
    }
}
```

### 6.6 Model Collections (`ModelCollection`)

QueryResult collections are wrapped in a fluent `ModelCollection` instance:

```javascript
const users = await User.all();

users.first();
users.last();
users.pluck("email");
users.groupBy("role");
users.sum("age");
users.avg("age");
users.sortBy("name");
users.toJSON();
```

---

## 7. Relationship Engine

### 7.1 `hasOne` & `belongsTo`

```javascript
class User extends Model {
    profile() {
        return this.hasOne(Profile, "user_id", "id");
    }
}

class Profile extends Model {
    user() {
        return this.belongsTo(User, "user_id", "id");
    }
}
```

### 7.2 `hasMany` & `belongsToMany` (Pivot Tables)

```javascript
class User extends Model {
    posts() {
        return this.hasMany(Post, "user_id", "id");
    }

    roles() {
        return this.belongsToMany(Role, "user_roles", "user_id", "role_id");
    }
}
```

### 7.3 Eager Loading & N+1 Prevention (`with`)

Eager load relationships to eliminate N+1 database queries:

```javascript
// Eager load single or multiple relationships
const users = await User.with("posts", "profile").get();

// Nested Eager Loading
const nested = await User.with("posts.comments.author").get();

// Eager Loading with Query Constraints
const filtered = await User.with({
    posts: (query) => query.where("status", "published")
}).get();
```

### 7.4 Relationship Aggregates (`withCount`, `withSum`, `withExists`)

```javascript
const users = await User.query()
    .withCount("posts")
    .withSum("orders", "total")
    .withExists("profile")
    .get();

console.log(users[0].posts_count);  // e.g. 5
console.log(users[0].orders_sum);    // e.g. 1250.00
console.log(users[0].profile_exists);// e.g. true
```

---

## 8. Scopes, Events & Observers

### 8.1 Global & Local Scopes

```javascript
// Local Scope (Prefix method with 'scope')
class Post extends Model {
    static scopePublished(query) {
        return query.where("status", "published");
    }
}

// Invoke Local Scope
const publishedPosts = await Post.query().published().get();

// Global Scope
Post.addGlobalScope("activeOnly", (query) => {
    query.whereNull("deleted_at");
});

// Bypass Global Scope
const allPosts = await Post.query().withoutGlobalScope("activeOnly").get();
```

### 8.2 Model Lifecycle Events

Hooks: `creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`.

```javascript
User.on("saving", (user) => {
    console.log("Saving user:", user.email);
    // Return false to halt save operation!
});
```

### 8.3 Observer Classes

Group model event handlers into Observer classes:

```javascript
class UserObserver {
    creating(user) {
        user.uuid = crypto.randomUUID();
    }

    deleted(user) {
        console.log("User purged:", user.id);
    }
}

User.observe(UserObserver);
```

---

## 9. Typed Database Exceptions

All exceptions thrown by `@ecfjs/database` derive from `DatabaseException`:

```
DatabaseException (extends Error)
 ├── ConnectionException
 ├── QueryException
 └── TransactionException
```

```javascript
import { QueryException, TransactionException } from "@ecfjs/database";

try {
    await DB.table("users").insert({ email: "duplicate@example.com" });
} catch (error) {
    if (error instanceof QueryException) {
        console.error("SQL Error Code:", error.code);
        console.error("Failed SQL:", error.sql);
    }
}
```

---

## 10. Complete End-to-End Practical Example

```javascript
import { Application, Facade } from "@ecfjs/core";
import { DatabaseServiceProvider, DB, Schema, Model } from "@ecfjs/database";

// 1. Initialize ECF Framework & Service Provider
const app = new Application();
app.register(DatabaseServiceProvider);

app.configure({
    database: {
        default: "sqlite",
        connections: {
            sqlite: { driver: "sqlite", database: ":memory:" }
        }
    }
});

app.boot();
Facade.setApplication(app);

// 2. Provision Database Schema
await Schema.create("users", (table) => {
    table.id();
    table.string("name");
    table.string("email").unique();
    table.timestamps();
});

await Schema.create("posts", (table) => {
    table.id();
    table.foreignId("user_id").constrained("users").cascadeOnDelete();
    table.string("title");
    table.text("body");
    table.string("status").default("draft");
    table.timestamps();
});

// 3. Define Model Classes with Relations
class Post extends Model {
    static table = "posts";
    static fillable = ["title", "body", "status", "user_id"];

    user() {
        return this.belongsTo(User, "user_id");
    }
}

class User extends Model {
    static table = "users";
    static fillable = ["name", "email"];

    posts() {
        return this.hasMany(Post, "user_id");
    }
}

// 4. Create Records via ORM
const author = await User.create({ name: "Jane Doe", email: "jane@example.com" });

await Post.create({
    user_id: author.id,
    title: "Introducing ECF Database Engine",
    body: "ECF Database engine provides enterprise ORM capabilities...",
    status: "published"
});

// 5. Query with Eager Loading & Aggregates
const usersWithPosts = await User.query()
    .with({ posts: (q) => q.where("status", "published") })
    .withCount("posts")
    .get();

for (const user of usersWithPosts) {
    console.log(`User: ${user.name} (${user.posts_count} published posts)`);
    for (const post of user.posts) {
        console.log(`  - Post: ${post.title}`);
    }
}
```

---

## 11. Troubleshooting & Best Practices

### 1. `QueryException: UNIQUE constraint failed: users.email`
- **Cause**: Attempting to insert a duplicate value into a column with a unique index.
- **Solution**: Catch `QueryException` or validate input beforehand using `@ecfjs/validation`.

### 2. `TransactionException: No active transaction to commit.`
- **Cause**: Executing `DB.commit()` without a preceding `DB.beginTransaction()`.
- **Solution**: Use `DB.transaction(async (conn) => { ... })` for automatic lifecycle management.

### 3. `DatabaseException: Relation 'X' is not defined on Model 'Y'.`
- **Cause**: Calling `.with("X")` on a model that lacks a relationship method named `X()`.
- **Solution**: Verify method name on model class and ensure it returns a valid `Relation` instance (`hasMany`, `belongsTo`, etc.).

---

## License

[MIT](LICENSE)
