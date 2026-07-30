# Configuration Manager

## Introduction

The Configuration Manager provides a unified store for application configuration options using simple dot-notation access strings.

## Why use it?

Hardcoding parameters such as database ports, application names, and timeout values across multiple files leads to duplication and fragile code. The Configuration Manager aggregates config data and provides flexible key resolution with fallback default values.

## Syntax

```js
import { Config } from "@ecf/core";

// Set configuration value
Config.set("key.path", value);

// Get configuration value with optional default
const value = Config.get("key.path", defaultValue);
```

## Example

```js
import { Application, Config, ConfigServiceProvider, Facade } from "@ecf/core";

const app = new Application();
app.register(ConfigServiceProvider);
app.boot();
Facade.setApplication(app);

// 1. Set nested configuration options
Config.set("app.name", "My ECF Application");
Config.set("database.mysql.host", "127.0.0.1");
Config.set("database.mysql.port", 3306);

// 2. Retrieve configuration options
console.log(Config.get("app.name")); // "My ECF Application"
console.log(Config.get("database.mysql.host")); // "127.0.0.1"

// 3. Fallback default value for undefined keys
console.log(Config.get("app.debug", false)); // false
```

## How it Works

1. **`Config.set("a.b.c", value)`**: Splits the dot-notation path string by `.` and recursively builds/navigates nested JavaScript objects, setting key `c` to `value`.
2. **`Config.get("a.b.c", defaultValue)`**: Navigates the nested object tree. If any intermediate segment is missing or `null`, or if the key does not exist, it immediately returns `defaultValue`.

## Parameters

### `get(path, defaultValue = null)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `path` | `string` | Dot-notation string representation of the config key path (e.g. `"app.url"`). |
| `defaultValue` | `any` | Value returned if the target path does not exist. Defaults to `null`. |

### `set(path, value)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `path` | `string` | Dot-notation string key where value will be set. |
| `value` | `any` | Value to store at the specified path. |

## Return Value

- `set()` returns the `ConfigManager` instance for method chaining.
- `get()` returns the stored configuration value or `defaultValue`.

## Notes

> [!NOTE]
> Config key paths are validated; passing an empty string or non-string key path will throw a `ConfigError`.

> [!TIP]
> Use `ConfigServiceProvider` to register the `"config"` key into the container automatically.

## Best Practices

- Standardize configuration keys under primary categories (`app`, `db`, `mail`, `services`).
- Always specify explicit fallback default values when fetching optional parameters: `Config.get("mail.port", 587)`.

## Common Mistakes

- **Passing non-string path**: Calling `Config.get(123)` will throw a `ConfigError`. Always pass a string.

## Tips

- Configuration data can hold primitives, arrays, or nested plain objects.

## Related Features

- [Environment Management](file:///f:/ecf/docs/core/environment.md)
- [Facades](file:///f:/ecf/docs/core/facades.md)

---

## Summary

The Configuration Manager simplifies accessing nested app settings with dot-notation and default value resolution.

## Next Topic

[Environment Management](file:///f:/ecf/docs/core/environment.md)

## Related Topics

- [Facades Architecture](file:///f:/ecf/docs/core/facades.md)
- [Application Lifecycle](file:///f:/ecf/docs/core/application.md)
