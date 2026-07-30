# Schema & Migrations

## Introduction

The Schema Builder provides a database-agnostic interface for defining and altering database tables, column types, primary keys, and constraints.

## Why use it?

Executing raw vendor-specific DDL SQL statements (`CREATE TABLE ...`) leads to code that cannot easily run across different database engines (e.g., SQLite vs Postgres). Schema Builder normalizes table creation across supported database engines.

## Syntax

```js
import { Schema } from "@ecf/database";

// Create database table schema
await Schema.create("table_name", (table) => {
    table.id();
    table.string("name");
    table.timestamps();
});

// Drop database table
await Schema.dropIfExists("table_name");
```

## Example

```js
import { Schema } from "@ecf/database";

// 1. Create users table schema
await Schema.create("users", (table) => {
    table.id(); // Auto-incrementing primary key
    table.string("name", 255);
    table.string("email").unique();
    table.string("password");
    table.boolean("is_active").default(true);
    table.timestamps(); // Adds created_at and updated_at
});

// 2. Create posts table schema with foreign key
await Schema.create("posts", (table) => {
    table.id();
    table.integer("user_id").notNull();
    table.string("title");
    table.text("content").nullable();
    table.timestamps();
});

// 3. Drop table safely
await Schema.dropIfExists("temporary_logs");
```

## How it Works

1. **Blueprint Compilation**: The callback function receives a `Blueprint` table definition instance. Calling methods like `table.string("email")` registers column definitions into an in-memory queue.
2. **DDL Generation**: Once the callback finishes, `Schema` compiles the column definitions into valid SQL DDL statements tailored to the active database driver (SQLite, MySQL, or Postgres) and executes the DDL.

## Column Types & Modifiers

### Common Column Methods

| Method | Description |
| ------ | ----------- |
| `table.id(name = "id")` | Auto-incrementing 64-bit integer primary key column. |
| `table.string(name, length = 255)` | VARCHAR column. |
| `table.text(name)` | TEXT column for long strings. |
| `table.integer(name)` | INTEGER column. |
| `table.boolean(name)` | BOOLEAN column. |
| `table.timestamps()` | Creates `created_at` and `updated_at` TIMESTAMP columns. |

### Column Modifiers

| Modifier | Description |
| -------- | ----------- |
| `.nullable()` | Allows NULL values in column. |
| `.default(value)` | Specifies default value for column. |
| `.unique()` | Applies unique constraint to column. |

## Return Value

- `Schema.create()` and `Schema.dropIfExists()` return a Promise resolving to `void`.

## Notes

> [!NOTE]
> `table.timestamps()` creates two nullable timestamp columns: `created_at` and `updated_at`.

> [!WARNING]
> Calling `Schema.dropIfExists()` permanently deletes target database tables and all contained data.

## Best Practices

- Always use `.unique()` on columns meant for unique lookups like `email` or `username`.
- Include `table.timestamps()` on all application domain entity tables.

## Common Mistakes

- **Forgetting `await` on `Schema.create()`**: Schema compilation and DDL execution are asynchronous. Always use `await`.

## Tips

- Use migration files to run `Schema.create()` inside `up()` methods and `Schema.dropIfExists()` inside `down()` methods.

## Related Features

- [Query Builder](file:///f:/ecf/docs/database/query-builder.md)
- [ORM Models](file:///f:/ecf/docs/database/orm-models.md)

---

## Summary

The Schema Builder allows programmatically defining database schemas, column types, and constraints across SQL databases.

## Next Topic

[Validation System](file:///f:/ecf/docs/validation/validator.md)

## Related Topics

- [Query Builder](file:///f:/ecf/docs/database/query-builder.md)
- [ORM Models & Relationships](file:///f:/ecf/docs/database/orm-models.md)
