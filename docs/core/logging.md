# Logging System

## Introduction

The Logging System provides structured log handling across different severity levels (`info`, `warning`, `error`, `critical`) using pluggable log transports.

## Why use it?

Standard `console.log` lacks structured context, timestamps, severity classification, and transport routing (such as file logging or error monitoring services). ECF Logger formats log messages consistently and supports multiple output channels.

## Syntax

```js
import { Log } from "@ecf/core";

// Log with context object
Log.info(message, context);
Log.warning(message, context);
Log.error(message, context);
Log.critical(message, context);
```

## Example

```js
import { Application, Facade, Log, LoggerServiceProvider } from "@ecf/core";

const app = new Application();
app.register(LoggerServiceProvider);
app.boot();
Facade.setApplication(app);

// Log messages with contextual metadata
Log.info("User session started", { userId: 101, ip: "127.0.0.1" });
Log.warning("High memory usage detected", { memoryUsedMB: 450 });
Log.error("Database connection lost", { host: "db.local", retryCount: 3 });
Log.critical("Payment gateway unresponsive", { gateway: "Stripe" });
```

## How it Works

1. **`LoggerManager`**: Holds a set of active transport instances (e.g. `ConsoleTransport`).
2. **`Log.info(msg, context)`**: Dispatches the log level, message, and metadata object to every registered transport.
3. **`ConsoleTransport`**: Formats the log output with ISO timestamps and level tags, outputting to `console.log`, `console.warn`, or `console.error`.

## Parameters

### `info(message, context = {})` / `warning()` / `error()` / `critical()`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `message` | `string` | Human-readable log message. |
| `context` | `object` | Optional metadata object providing context. Defaults to `{}`. |

### `addTransport(transport)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `transport` | `object` | An object implementing a `log(level, message, context)` method. |

## Return Value

Log methods return the `LoggerManager` instance for method chaining.

## Custom Transports

You can easily register custom transports (e.g. for external monitoring):

```js
class FileTransport {
    log(level, message, context) {
        const entry = `${new Date().toISOString()} [${level.toUpperCase()}] ${message} ${JSON.stringify(context)}\n`;
        // Write entry to file stream
    }
}

Log.addTransport(new FileTransport());
```

## Notes

> [!NOTE]
> `LoggerServiceProvider` registers a default `ConsoleTransport` bound to the container key `"logger"`.

## Best Practices

- Always pass structured context objects instead of concatenating strings: `Log.error("Failed to load user", { userId })`.
- Use `critical()` for unexpected system outages or unhandled service failures.

## Common Mistakes

- **Passing non-object context**: Passing strings or numbers into the second argument of log calls.

## Tips

- Create custom transports for integrating with logging backends like Datadog, CloudWatch, or Elasticsearch.

## Related Features

- [Event System](file:///f:/ecf/docs/core/events.md)
- [Facades](file:///f:/ecf/docs/core/facades.md)

---

## Summary

The Logging System standardizes structured logs with pluggable transports and multi-level severity dispatch.

## Next Topic

[HTTP Routing](file:///f:/ecf/docs/http/routing.md)

## Related Topics

- [Event System](file:///f:/ecf/docs/core/events.md)
- [Configuration Manager](file:///f:/ecf/docs/core/config.md)
