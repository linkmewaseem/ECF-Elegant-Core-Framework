# `@ecf/validation` — Enterprise Validation Engine

`@ecf/validation` is the rule-based validation engine for the ECF (Elegant Core Framework) ecosystem.

---

## Features

- **Validator** — fluent rule-based payload validation
- **RuleRegistry** — extensible custom rule registration
- **ValidationErrorBag** — structured field-level error collection
- **Built-in Rules** — `required`, `email`, `min`, `max`, `uuid`, `regex`, and 30+ more
- **Conditional Rules** — `requiredIf`, `excludeIf`, and nested object validation
- **HTTP Integration** — automatic 422 mapping via `@ecf/http` FormRequest

---

## Quick Start

### 1. Basic Validation

```javascript
import { Validator } from "@ecf/validation";

const result = Validator.make(
  { email: "user@example.com", age: 25 },
  { email: "required|email", age: "required|integer|min:18" }
);

if (result.fails()) {
  console.log(result.errors().all());
}
```

### 2. Custom Rules

```javascript
import { Validator, RuleRegistry } from "@ecf/validation";

RuleRegistry.register("uppercase", (value) => value === value.toUpperCase());

const result = Validator.make({ code: "ABC" }, { code: "required|uppercase" });
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — package architecture

---

## License

MIT
