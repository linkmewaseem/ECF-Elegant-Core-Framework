# `@ecfjs/support` — Collections & Utilities

`@ecfjs/support` provides foundational collection and string utilities for the ECF (Elegant Core Framework) ecosystem.

---

## Features

- **Collection** — fluent array manipulation (`map`, `filter`, `pluck`, `groupBy`)
- **LazyCollection** — memory-efficient lazy iteration
- **Str** — string helpers (`slug`, `camel`, `snake`, `studly`)
- **Arr** — array helpers (`wrap`, `flatten`, `only`, `except`)
- **Macroable** — runtime method extension mixin
- **Fluent** — chainable value wrapper

---

## Quick Start

```javascript
import { Collection, Str } from "@ecfjs/support";

const names = new Collection([{ name: "Alice" }, { name: "Bob" }])
  .pluck("name")
  .map((n) => Str.studly(n))
  .all();

console.log(names); // ["Alice", "Bob"]
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — package architecture

---

## License

MIT
