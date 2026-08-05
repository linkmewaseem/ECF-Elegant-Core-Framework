# `@ecfjs/api` Architecture & Design Specification

## Overview
`@ecfjs/api` provides a complete, enterprise-grade API Platform for ECF applications.

```text
HTTP Request
     │
     ▼
[ CorrelationIdMiddleware -> ContentNegotiation -> ApiVersion -> RateLimit -> Idempotency -> ETag ]
     │
     ▼
Controller Execution
     │
     ▼
ApiResource / ResourceCollection (Sparse Fieldsets -> Include Relations -> Cursor Pagination)
     │
     ▼
ApiResponseBuilder / ProblemDetails (RFC-9457)
     │
     ▼
HTTP Response + OpenAPI Generator (/docs/api)
```

## Performance & Compliance Standards

| Metric / Specification | Target / Standard |
| :--- | :--- |
| **Error Specification** | RFC-9457 / RFC-7807 Problem Details |
| **OpenAPI Specification** | OpenAPI 3.0.3 (`openapi.json`) |
| **ETag Calculation** | SHA-256 / CRC32 Fast Hashing |
| **Resource Transformation** | < 1ms per 1,000 objects |

## Core Architectural Modules
1. **API Resources (`ApiResource` & `ResourceCollection`)**: Laravel-style transformation with conditional fields (`when`, `merge`, `whenLoaded`, `whenCounted`), sparse fieldsets (`?fields=...`), include relations (`?include=...`), and cursor pagination (`nextCursor`, `prevCursor`).
2. **Versioning (`ApiVersionManager`)**: Multi-strategy URI, Accept header, X-Api-Version header, and query param versioning.
3. **Advanced Rate Limiting (`ApiRateLimiter`)**: Per User, Token, IP, and Route rate limiters backed by `@ecfjs/cache`.
4. **Idempotency & ETags**: `Idempotency-Key` middleware and `If-None-Match` 304 Not Modified caching.
5. **OpenAPI Generator & Swagger UI**: Route inspection building OpenAPI 3.0 specification and Swagger UI dashboard.
6. **RFC-9457 Problem Details & Response Builder**: Fluent response helpers and standardized error payloads.
