# Core Subsystem Documentation (`@ecf/core`, `@ecf/support`, `@ecf/config`, `@ecf/events`, `@ecf/contracts`)

The Core Subsystem forms the foundational foundation of ECF (Enterprise Core Framework), providing IoC container binding, dependency injection, lifecycle events, hierarchical config management, and standard interfaces.

---

## 🏛️ IoC Container (`@ecf/core`)

ECF's container manages singleton and transient bindings:

```js
import { Container } from "@ecf/core";

const container = new Container();
container.singleton("logger", () => new Logger());
const logger = container.make("logger");
```

---

## ⚙️ Config Management (`@ecf/config`)

Hierarchical dot-notation config store with environment defaults:

```js
import { Config } from "@ecf/config";

const dbConnection = Config.get("database.default", "sqlite");
```

---

## 📡 Event Bus (`@ecf/events`)

Priority-based async event dispatcher:

```js
import { Event } from "@ecf/events";

Event.listen("UserRegistered", async (event) => {
  // Event listener logic
});
```

---

## 📄 License
MIT Licensed.
