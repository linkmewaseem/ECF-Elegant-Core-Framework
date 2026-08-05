# Core Subsystem Documentation (`@ecfjs/core`, `@ecfjs/support`, `@ecfjs/config`, `@ecfjs/events`, `@ecfjs/contracts`)

The Core Subsystem forms the foundational foundation of ECF (Enterprise Core Framework), providing IoC container binding, dependency injection, lifecycle events, hierarchical config management, and standard interfaces.

---

## 🏛️ IoC Container (`@ecfjs/core`)

ECF's container manages singleton and transient bindings:

```js
import { Container } from "@ecfjs/core";

const container = new Container();
container.singleton("logger", () => new Logger());
const logger = container.make("logger");
```

---

## ⚙️ Config Management (`@ecfjs/config`)

Hierarchical dot-notation config store with environment defaults:

```js
import { Config } from "@ecfjs/config";

const dbConnection = Config.get("database.default", "sqlite");
```

---

## 📡 Event Bus (`@ecfjs/events`)

Priority-based async event dispatcher:

```js
import { Event } from "@ecfjs/events";

Event.listen("UserRegistered", async (event) => {
  // Event listener logic
});
```

---

## 📄 License
MIT Licensed.
