# ECF — Cross-Package Integration Test Matrix

This document defines the required **Integration Test Combinations** that must be validated prior to every release of the ECF (Elegant Core Framework) ecosystem.

---

## 🧪 Integration Combination Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ECF Cross-Package Integration Suite                    │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Integration Pair               │ Verified Capabilities & Integration Target │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 1. Core + HTTP                 │ IoC Container registration, Service        │
│                                │ Provider booting, Event Dispatching over   │
│                                │ HTTP request lifecycle.                    │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 2. HTTP + Validation           │ FormRequest automatic payload validation,  │
│                                │ ValidationErrorBag HTTP status 422 mapping.│
├────────────────────────────────┼────────────────────────────────────────────┤
│ 3. HTTP + View                 │ Response `.view('user.profile', data)`     │
│                                │ rendering, view engine context injection.  │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 4. Database + HTTP             │ Model route parameter binding, ORM active  │
│                                │ record query execution inside controllers. │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 5. Skeleton + CLI              │ Generator scaffolding (`make:controller`,   │
│                                │ `make:model`) creating valid skeleton code.│
├────────────────────────────────┼────────────────────────────────────────────┤
│ 6. Queue + Database            │ Background job payload persistence,        │
│                                │ retry counting, transaction rollback.      │
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 📋 Integration Test Execution Standard

Each integration combination is backed by an automated test file located in `packages/skeleton/tests/` or dedicated integration suites:

1. **`Core + HTTP`**: Verifies `app.listen()` and `app.use()` wire correctly with `HttpKernel` and `HttpServer`.
2. **`HTTP + Validation`**: Verifies that a failed `FormRequest` returns a `422 Unprocessable Content` response with structured JSON validation errors.
3. **`HTTP + View`**: Verifies that template files in `resources/views/` render correctly to HTML streams when invoked via HTTP controllers.
4. **`Database + HTTP`**: Verifies that route model binding (`/users/{user}`) resolves the corresponding database model instance or throws a `404 Not Found` error automatically.
5. **`Skeleton + CLI`**: Verifies `ecf doctor` and scaffolding commands operate cleanly against a fresh skeleton installation.
