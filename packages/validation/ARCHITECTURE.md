# @ecfjs/validation — Package Architecture

`@ecfjs/validation` is the rule-based validation engine for the ECF ecosystem.

## Core Components

- **`Validator`**: Orchestrates rule parsing, field traversal, and result aggregation.
- **`RuleRegistry`**: Registers built-in and custom validation rules.
- **`ValidationResult`**: Immutable pass/fail result with error bag access.
- **`ValidationErrorBag`**: Field-keyed error message collection for HTTP 422 responses.
- **`Rule`**: Base class for object-oriented custom rules.

## Dependencies

- Zero dependencies on outer ECF packages (standalone validation engine).
- Consumed by `@ecfjs/http` via `FormRequest` integration.

## Dependency Rules

- MUST NOT depend on `@ecfjs/http`, `@ecfjs/database`, or `@ecfjs/view`.
- Public API is limited to `src/index.js` exports.
