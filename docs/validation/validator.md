# Validation System

## Introduction

The ECF Validation System provides structured data validation for HTTP request inputs, form submissions, and domain objects using expressive rule syntax.

## Why use it?

Unsanitized and unvalidated user input causes security risks, runtime errors, and corrupted database records. The Validation System evaluates complex data payloads against customizable validation rules, providing structured error messages when validation fails.

## Syntax

```js
import { Validator } from "@ecf/validation";

// Create a validator instance
const validator = Validator.make(data, rules, customMessages);

// Execute validation checks
if (validator.fails()) {
    const errors = validator.errors().all();
}
```

## Example

```js
import { RuleRegistry, Validator } from "@ecf/validation";

// 1. Input data object
const inputData = {
    username: "john_doe",
    email: "john@example.com",
    age: 25,
    role: "user"
};

// 2. Define validation rules
const rules = {
    username: "required|string|min:3|max:20",
    email: "required|email",
    age: "required|numeric|min:18",
    role: "required|in:user,admin,editor"
};

// 3. Perform validation
const validator = Validator.make(inputData, rules);

if (validator.fails()) {
    console.log("Validation errors:", validator.errors().all());
} else {
    console.log("Validation passed successfully!");
}
```

## How it Works

1. **`Validator.make(data, rules)`**: Parses pipe-delimited rule strings (e.g. `"required|email|min:5"`) into individual rule tokens.
2. **Rule Execution**: Sequentially runs each rule runner registered in `RuleRegistry`.
3. **Error Bag Collection**: If a rule check fails, an error message is generated and appended to the `ValidationErrorBag` for that target field.

## Built-in Validation Rules

| Rule | Parameters | Description |
| ---- | ---------- | ----------- |
| `required` | None | Field must be present and not `null`, `undefined`, or empty string `""`. |
| `string` | None | Field value must be a string. |
| `numeric` | None | Field value must be a number or numeric string. |
| `email` | None | Field value must match standard email address regex. |
| `min` | `value` | String length or numeric value must be `>= value`. |
| `max` | `value` | String length or numeric value must be `<= value`. |
| `in` | `val1,val2...` | Field value must be present in the provided list. |
| `array` | None | Field value must be an array. |

## Registering Custom Rules

You can easily register custom validation rules via `RuleRegistry`:

```js
import { RuleRegistry } from "@ecf/validation";

// Register a custom rule checking for uppercase string
RuleRegistry.register("uppercase", (value) => {
    return typeof value === "string" && value === value.toUpperCase();
}, "The :attribute must be uppercase.");
```

## Methods Table

### `Validator.make(data, rules, messages = {})`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `data` | `object` | Data dictionary to validate. |
| `rules` | `object` | Field-to-rule dictionary mapping fields to rule strings or rule arrays. |
| `messages` | `object` | Optional custom field error messages dictionary. |

### `errors()`

Takes no parameters. Returns the `ValidationErrorBag` instance containing validation error messages.

### `passes()` / `fails()`

Take no parameters. Return a `boolean` indicating whether validation succeeded or failed.

## Return Value

- `Validator.make()` returns a `Validator` instance.
- `validator.passes()` and `validator.fails()` return `boolean`.
- `validator.errors()` returns a `ValidationErrorBag` instance.

## Notes

> [!NOTE]
> Rules can be specified as pipe-delimited strings (`"required|email"`) or arrays (`["required", "email"]`).

## Best Practices

- Validate all incoming HTTP request body payloads in middleware or route handlers before performing database writes.
- Return HTTP 422 Unprocessable Entity when validation fails: `return res.status(422).json({ errors: validator.errors().all() })`.

## Common Mistakes

- **Forgetting parameter colon**: Writing `"min 5"` instead of `"min:5"`.

## Tips

- Retrieve the first error for a specific field using `validator.errors().first("email")`.

## Related Features

- [HTTP Request](file:///f:/ecf/docs/http/requests.md)
- [HTTP Response](file:///f:/ecf/docs/http/responses.md)

---

## Summary

The Validation System offers pipe-delimited rule strings, built-in validators, custom rules, and clean error bags.

## Next Topic

[Framework Reference & Directory Structure](file:///f:/ecf/docs/architecture/directory-structure.md)

## Related Topics

- [HTTP Request](file:///f:/ecf/docs/http/requests.md)
- [HTTP Response](file:///f:/ecf/docs/http/responses.md)
