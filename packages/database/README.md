# `@ecfjs/database` — Enterprise ORM & Query Builder

`@ecfjs/database` is the enterprise ORM and AST QueryBuilder engine for the ECF (Elegant Core Framework) ecosystem.

---

## Features

- **Multi-Driver** — SQLite, MySQL, PostgreSQL, and MSSQL dialect compilers
- **QueryBuilder** — immutable AST query mutators (`where`, `join`, `orderBy`, `with`)
- **Model** & **ModelRepository** — Active Record + Data Mapper with dirty tracking
- **RelationPlan** — eager loading (`hasOne`, `hasMany`, `belongsTo`, `belongsToMany`)
- **Migrations** — schema builder and migration runner
- **Query Cache** — memory, file, and Redis cache stores
- **Query Profiler** — telemetry and performance metrics

---

## Quick Start

### 1. Define a Model

```javascript
import { Model } from "@ecfjs/database";

export class User extends Model {
  static table = "users";
  static fillable = ["name", "email"];
}
```

### 2. Query Builder

```javascript
import { Connection } from "@ecfjs/database";

const users = await Connection.table("users")
  .where("active", true)
  .orderBy("created_at", "desc")
  .limit(10)
  .get();
```

### 3. Eloquent-Style ORM

```javascript
const user = await User.find(1);
user.name = "Jane Doe";
await user.save();
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — package architecture
- [BENCHMARKS.md](./BENCHMARKS.md) — hydration and query performance SLAs

---

## License

MIT
