# Query Builder

## Introduction

The ECF Query Builder provides a fluent, chainable API for building and executing SQL database queries safely across SQLite, MySQL, and PostgreSQL backends.

## Why use it?

Writing raw SQL queries manually is prone to SQL injection vulnerabilities and syntax differences between database vendors. The Query Builder sanitizes inputs automatically using parameterized bindings while offering an intuitive JS syntax.

## Syntax

```js
import { DB } from "@ecf/database";

// Basic Query Builder pipeline
const results = await DB.table("users")
    .select("id", "name", "email")
    .where("status", "active")
    .orderBy("created_at", "DESC")
    .limit(10)
    .get();
```

## Example

```js
import { Application, DatabaseServiceProvider, DB, Facade } from "@ecf/database";

const app = new Application();
app.register(DatabaseServiceProvider);
app.boot();
Facade.setApplication(app);

// 1. SELECT query with conditions
const activeUsers = await DB.table("users")
    .select("id", "name", "role")
    .where("status", "=", "active")
    .where("age", ">=", 18)
    .orderBy("name", "ASC")
    .get();

// 2. Fetch single record
const user = await DB.table("users").where("id", 42).first();

// 3. INSERT query
const insertedId = await DB.table("users").insert({
    name: "Jane Doe",
    email: "jane@example.com",
    status: "active"
});

// 4. UPDATE query
const affectedRows = await DB.table("users")
    .where("id", 42)
    .update({ status: "suspended" });

// 5. DELETE query
await DB.table("users").where("status", "inactive").delete();
```

## How it Works

1. **`DB.table(name)`**: Instantiates a clean query compiler bound to the active database connection.
2. **Method Chaining**: Methods like `.select()`, `.where()`, and `.orderBy()` mutate internal query state structures and return `this`.
3. **Parameterized SQL Generation**: When terminal execution methods (`.get()`, `.first()`, `.insert()`, `.update()`, `.delete()`) are invoked, the compiler builds sanitized SQL (`SELECT * FROM users WHERE status = ?`) and executes it using parameterized values.

## Methods Table

### `table(name)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `name` | `string` | Database table name to target. |

### `select(...columns)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `...columns` | `string[]` | Column names to retrieve. Defaults to `*`. |

### `where(column, operator, value)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `column` | `string` | Database column name. |
| `operator` | `string` | Comparison operator (`=`, `>`, `<`, `>=`, `<=`, `LIKE`). If omitted, defaults to `=`. |
| `value` | `any` | Value to compare against. |

### `insert(data)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `data` | `object \| object[]` | Object containing column-value pairs or array of objects to insert. |

### `update(data)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `data` | `object` | Object containing column-value pairs to update. |

## Return Value

- `.get()` returns a Promise resolving to an `Array` of record objects.
- `.first()` returns a Promise resolving to a single record `object` or `null`.
- `.insert()` returns a Promise resolving to the inserted primary key or insert status.
- `.update()` and `.delete()` return a Promise resolving to the count of affected rows (`number`).

## Notes

> [!NOTE]
> Values passed to `.where()`, `.insert()`, and `.update()` are automatically bound as SQL parameters to prevent SQL injection.

## Best Practices

- Always use `.first()` when expecting a single unique record instead of `.get()[0]`.
- Wrap multiple mutating operations inside transactions using `DB.transaction(async () => { ... })`.

## Common Mistakes

- **Forgetting `await`**: Omitting `await` on terminal calls (`await DB.table(...).get()`) returns an unresolved Promise.

## Tips

- You can run raw SQL queries if needed using `DB.raw("SELECT * FROM users WHERE id = ?", [id])`.

## Related Features

- [ORM Models & Relationships](file:///f:/ecf/docs/database/orm-models.md)
- [Schema & Migrations](file:///f:/ecf/docs/database/schema-migrations.md)

---

## Summary

The ECF Query Builder provides fluent, type-safe SQL query generation with parameter binding.

## Next Topic

[ORM Models & Relationships](file:///f:/ecf/docs/database/orm-models.md)

## Related Topics

- [ORM Models & Relationships](file:///f:/ecf/docs/database/orm-models.md)
- [Schema & Migrations](file:///f:/ecf/docs/database/schema-migrations.md)
