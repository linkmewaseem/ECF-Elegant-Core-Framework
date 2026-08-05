# ADR-003: AST-Based Directive View Compiler & Dependency Cache

## Status
**Accepted** (Implemented in `@ecfjs/view`)

## Context
Simple regex-replacement template engines fail to handle complex nested directives (e.g. `@if` inside `@for` inside `@switch`, or `@break` / `@continue` loop targeting). We needed an enterprise-grade Blade-style view engine with fast compile times (<10ms) and automatic dependency tracking.

## Decision
1. Implement a 3-stage AST View Engine: `Lexer ➔ AST Parser ➔ JS Generator`.
2. Support full structural directives (`@if`, `@else`, `@unless`, `@for`, `@forelse`, `@switch`, `@case`, `@default`, `@break`, `@continue`, `@extends`, `@section`, `@component`, `@push`, `@stack`, `@once`).
3. Build a `ViewCache` engine with file hash verification and child view dependency tracking so parent views automatically recompile when included partials change.

## Consequences

### Positive
- Correct handling of arbitrarily deep directive nesting and expression evaluation.
- Superior rendering speed once compiled (<10ms compile, near-native JS function render).
- Automatic cache invalidation when partial templates are updated.

### Negative
- AST compilation introduces higher initial codebase complexity compared to regex string replacement.
