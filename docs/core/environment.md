# Environment Management

## Introduction

The Environment Manager handles environment variables for ECF applications. It loads variables from `.env` files and environment settings into a secure container store.

## Why use it?

Sensitive credentials like API secrets, database passwords, and environment modes should never be hardcoded into source code. Environment Management isolates configuration per environment (development, staging, production).

## Syntax

```js
import { Env } from "@ecf/core";

// Get environment variable with optional fallback default
const envValue = Env.get("KEY_NAME", defaultValue);

// Check if environment variable exists
const exists = Env.has("KEY_NAME");
```

## Example

Assuming a `.env` file in your root folder:

```env
APP_ENV=development
APP_PORT=3000
DATABASE_URL=sqlite://storage/app.db
ENABLE_METRICS=true
```

Fetching variables in JS:

```js
import { Application, EnvironmentServiceProvider, Env, Facade } from "@ecf/core";

const app = new Application();
app.register(EnvironmentServiceProvider);
app.boot();
Facade.setApplication(app);

console.log(Env.get("APP_ENV")); // "development"
console.log(Env.get("APP_PORT", 8080)); // "3000"
console.log(Env.get("SECRET_KEY", "fallback_secret")); // "fallback_secret"
```

## How it Works

1. **`DotEnvLoader`**: Scans the project root directory for `.env` files, parses key-value lines, strips comments (`#`), trims whitespace, and populates `EnvManager`.
2. **`Env.get(key, defaultValue)`**: Checks if `key` exists within internal store. Returns stored value or fallback `defaultValue`.

## Parameters

### `get(key, defaultValue = null)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `key` | `string` | The environment variable key name (e.g. `"APP_PORT"`). |
| `defaultValue` | `any` | Value returned if the key is missing. Defaults to `null`. |

### `set(key, value)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `key` | `string` | Environment key name to define or override. |
| `value` | `any` | Value to assign. |

### `has(key)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `key` | `string` | Key name to check. |

## Return Value

- `get()` returns `string`, `any`, or `defaultValue`.
- `has()` returns a `boolean`.
- `set()` returns the `EnvManager` instance for chaining.

## Notes

> [!CAUTION]
> Never commit `.env` files containing production credentials to version control. Always include `.env` in your `.gitignore` file.

## Best Practices

- Provide a `.env.example` file in repository root to document expected variables for team members.
- Use `EnvironmentServiceProvider` to automatically load environment settings during application boot.

## Common Mistakes

- **Key typos**: Requesting `Env.get("PORT")` when `.env` defines `APP_PORT`.

## Tips

- Combine `Env` with `Config` in your service providers to supply defaults to app configurations.

## Related Features

- [Configuration Manager](file:///f:/ecf/docs/core/config.md)
- [Facades](file:///f:/ecf/docs/core/facades.md)

---

## Summary

The Environment Manager loads `.env` files and exposes safe accessors for environment configurations.

## Next Topic

[Event System](file:///f:/ecf/docs/core/events.md)

## Related Topics

- [Configuration Manager](file:///f:/ecf/docs/core/config.md)
- [Service Providers](file:///f:/ecf/docs/core/service-providers.md)
