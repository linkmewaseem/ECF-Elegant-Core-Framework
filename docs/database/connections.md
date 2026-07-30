# Database Connections & Drivers

## Introduction

The ECF Database Layer manages connection pools, database drivers, and raw SQL queries across SQLite, MySQL, and PostgreSQL backends through a unified `DatabaseManager` interface.

## Why use it?

Applications often need to support multiple database environments—such as using an in-memory SQLite database for fast unit testing while connecting to MySQL or PostgreSQL in production. ECF abstracts driver differences so you can configure connections declaratively without altering query logic.

## Syntax

```js
import { Config, DB } from "@ecf/database";

// Configure database connections
Config.set("database", {
    default: "sqlite",
    connections: {
        sqlite: {
            driver: "sqlite",
            database: "./storage/database.sqlite"
        },
        mysql: {
            driver: "mysql",
            host: "127.0.0.1",
            port: 3306,
            database: "my_app",
            username: "root",
            password: "secret_password"
        },
        postgres: {
            driver: "pgsql",
            host: "127.0.0.1",
            port: 5432,
            database: "my_app",
            username: "postgres",
            password: "secret_password"
        }
    }
});

// Access default connection
const connection = DB.connection();

// Access specific named connection
const mysqlConn = DB.connection("mysql");
```

## Example

Here is how to set up database connections using `.env` and `ConfigServiceProvider` in ECF:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ecommerce_app
DB_USERNAME=admin
DB_PASSWORD=secret
```

```js
import { Application, Config, ConfigServiceProvider, DatabaseServiceProvider, DB, Env, EnvironmentServiceProvider, Facade } from "@ecf/database";

// 1. Bootstrap Application & Service Providers
const app = new Application();
app.register(EnvironmentServiceProvider);
app.register(ConfigServiceProvider);
app.register(DatabaseServiceProvider);
app.boot();
Facade.setApplication(app);

// 2. Configure Database Connections using Env
Config.set("database", {
    default: Env.get("DB_CONNECTION", "sqlite"),
    connections: {
        sqlite: {
            driver: "sqlite",
            database: Env.get("DB_FILE", ":memory:")
        },
        mysql: {
            driver: "mysql",
            host: Env.get("DB_HOST", "127.0.0.1"),
            port: parseInt(Env.get("DB_PORT", 3306)),
            database: Env.get("DB_DATABASE", "my_db"),
            username: Env.get("DB_USERNAME", "root"),
            password: Env.get("DB_PASSWORD", "")
        },
        postgres: {
            driver: "pgsql",
            host: Env.get("DB_HOST", "127.0.0.1"),
            port: parseInt(Env.get("DB_PORT", 5432)),
            database: Env.get("DB_DATABASE", "my_db"),
            username: Env.get("DB_USERNAME", "postgres"),
            password: Env.get("DB_PASSWORD", "")
        }
    }
});

// 3. Executing Raw SQL Queries
const users = await DB.select("SELECT * FROM users WHERE status = ?", ["active"]);
console.log(users);

// 4. Executing Transactions
await DB.transaction(async (conn) => {
    await conn.insert("INSERT INTO accounts (user_id, balance) VALUES (?, ?)", [101, 500]);
    await conn.update("UPDATE stats SET total_accounts = total_accounts + 1");
});
```

## How it Works

1. **`ConnectionManager`**: Reads connection configurations from `Config.get("database")`. It instantiates database drivers lazily on demand when `DB.connection(name)` is called and caches active connections.
2. **Supported Drivers**:
   - `sqlite` (using native SQLite / memory engine).
   - `mysql` (using MySQL driver).
   - `pgsql` / `postgres` (using PostgreSQL driver).
3. **Transaction Safety**: `DB.transaction(callback)` starts a transaction on the connection. If the callback resolves successfully, `COMMIT` is issued. If an exception is thrown, `ROLLBACK` is executed automatically and the error is re-thrown.

## Methods Table

### `connection(name = null)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `name` | `string \| null` | Name of the connection defined in configuration. If `null`, resolves the default connection. |

### `select(sql, bindings = [])`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `sql` | `string` | Parameterized SQL SELECT string. |
| `bindings` | `array` | Array of parameters bound to SQL placeholders (`?`). |

### `insert(sql, bindings = [])` / `update()` / `delete()`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `sql` | `string` | Parameterized SQL mutation string. |
| `bindings` | `array` | Array of parameters bound to SQL placeholders. |

### `transaction(callback)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `callback` | `AsyncFunction` | Callback receiving the active connection instance. Executes within transaction block. |

### `disconnect(name = null)` / `disconnectAll()`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `name` | `string \| null` | Name of target connection to close and uncache. |

## Return Value

- `DB.connection()` returns a `Connection` instance.
- `DB.select()` returns a Promise resolving to an array of record objects.
- `DB.insert()`, `DB.update()`, `DB.delete()` return Promises resolving to affected row count or insert ID.
- `DB.transaction()` returns a Promise resolving to the return value of the callback.

## Notes

> [!NOTE]
> Database driver configuration defaults to SQLite in-memory (`:memory:`) if no configuration object is provided.

> [!IMPORTANT]
> Always pass dynamic user input via SQL bindings `?` to prevent SQL injection vulnerabilities.

## Best Practices

- Store database host, user, and password credentials in `.env` files.
- Close unused database connections during unit testing using `DB.disconnectAll()`.

## Common Mistakes

- **Forgetting `await` on transactions or raw queries**: Raw SQL queries return Promises. Always use `await`.

## Tips

- You can dynamically register a custom database driver class using `DB.registerDriver("oracle", CustomOracleDriver)`.

## Related Features

- [Query Builder](file:///f:/ecf/docs/database/query-builder.md)
- [ORM Models & Relationships](file:///f:/ecf/docs/database/orm-models.md)
- [Schema & Migrations](file:///f:/ecf/docs/database/schema-migrations.md)

---

## Summary

The Database Connections & Drivers module handles driver initialization, multi-database connection pooling, raw SQL queries, and transaction management.

## Next Topic

[Query Builder](file:///f:/ecf/docs/database/query-builder.md)

## Related Topics

- [Query Builder](file:///f:/ecf/docs/database/query-builder.md)
- [ORM Models & Relationships](file:///f:/ecf/docs/database/orm-models.md)
