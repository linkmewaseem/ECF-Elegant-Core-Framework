# Event System

## Introduction

The Event System provides a lightweight publish-subscribe implementation for emitting and listening to application events with error isolation.

## Why use it?

Decoupling application components prevents high cross-dependency. For instance, when a user registers, sending a welcome email, generating an analytics event, and updating stats can occur independently via event listeners without cluttering the registration controller.

## Syntax

```js
import { Event } from "@ecf/core";

// Register an event listener
Event.listen(eventName, listenerCallback);

// Dispatch an event with payload data
Event.dispatch(eventName, payloadObject);
```

## Example

```js
import { Application, Event, EventServiceProvider, Facade } from "@ecf/core";

const app = new Application();
app.register(EventServiceProvider);
app.boot();
Facade.setApplication(app);

// 1. Register event listeners
Event.listen("user.registered", (user) => {
    console.log(`[Email Service]: Welcome email sent to ${user.email}`);
});

Event.listen("user.registered", (user) => {
    console.log(`[Analytics]: User ${user.id} logged in analytics.`);
});

// 2. Dispatch event
Event.dispatch("user.registered", { id: 42, email: "user@example.com" });
```

## How it Works

1. **`Event.listen(name, callback)`**: Stores listeners in a `Set` associated with the event string key.
2. **`Event.dispatch(name, payload)`**: Iterates over registered listeners synchronously, executing each callback with `payload`.
3. **Error Isolation**: If one listener throws an error, `EventManager` catches the exception, logs it via the logger, records the error details in a returned error array, and continues executing subsequent listeners without crashing the event loop.

## Parameters

### `listen(event, listener)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `event` | `string` | The event string identifier (e.g., `"user.created"`). |
| `listener` | `Function` | Callback receiving the event payload object. |

### `dispatch(event, payload = {})`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `event` | `string` | The event string identifier to trigger. |
| `payload` | `object` | Optional data payload passed to listeners. Defaults to `{}`. |

### `forget(event)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `event` | `string` | The event string to remove along with all registered listeners. |

## Return Value

- `listen()`, `forget()`, and `clear()` return the `EventManager` instance.
- `dispatch()` returns an array of caught error objects (`[{ event, listener, error }]`), or an empty array `[]` if all listeners succeeded.

## Notes

> [!NOTE]
> `EventManager` requires a logger service registered in the container so errors can be safely captured without terminating processes.

## Best Practices

- Use dot-notation for event names (`"order.created"`, `"payment.failed"`).
- Register listeners in the `boot()` method of Service Providers.

## Common Mistakes

- **Passing non-function as listener**: Passing an object or string into `listen()` throws an `EventError`.

## Tips

- Check the return value of `Event.dispatch()` if you need to detect whether any async background operations failed.

## Related Features

- [Logging System](file:///f:/ecf/docs/core/logging.md)
- [Service Providers](file:///f:/ecf/docs/core/service-providers.md)

---

## Summary

The Event System facilitates loosely-coupled event publishing and listening with built-in error handling isolation.

## Next Topic

[Logging System](file:///f:/ecf/docs/core/logging.md)

## Related Topics

- [Service Providers](file:///f:/ecf/docs/core/service-providers.md)
- [Application Lifecycle](file:///f:/ecf/docs/core/application.md)
