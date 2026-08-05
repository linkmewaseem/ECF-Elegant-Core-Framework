# ADR-009: Enterprise API Platform Architecture

## Status
**Accepted** (Implemented in `@ecfjs/api`)

## Context
Building enterprise web services and public/internal APIs requires consistent JSON serialization, relationship nesting, sparse fieldsets, cursor pagination, API versioning, multi-level rate limiting, OpenAPI specification generation, RFC-9457 error formatting, ETag caching, idempotency checks, and testing harnesses. Prior to Milestone 26, API routes returned raw objects or manual JSON responses.

## Decision
1. **API Resources & Collections (`ApiResource` & `ResourceCollection`)**:
   Provides Laravel-style data transformation with conditional fields (`when`, `merge`, `mergeWhen`, `whenLoaded`, `whenCounted`), Sparse Fieldsets (`?fields=id,name`), Include Relationships (`?include=user,comments`), and Cursor Pagination (`nextCursor`, `prevCursor`).
2. **Multi-Strategy API Versioning**:
   `ApiVersionManager` resolves API versioning via URI path (`/api/v1`), Accept headers (`application/vnd.ecf.v2+json`), custom headers (`X-Api-Version`), or query parameters (`?v=2`).
3. **Advanced Rate Limiting & Security**:
   Multi-granularity rate limiting (per User, per Token, per IP, per Route) integrated with `@ecfjs/cache`. Supports Bearer tokens, JWT, PAT, and API Keys via `@ecfjs/auth`.
4. **OpenAPI 3.0 Generator & Swagger UI**:
   Automatically inspects registered `@ecfjs/http` routes and produces compliant `openapi.json` / `swagger.json` specs while serving interactive Swagger UI HTML dashboard at `/docs/api`.
5. **RFC-9457 Problem Details & Response Builders**:
   Implements RFC-9457 / RFC-7807 compliant error formatters (`type`, `title`, `status`, `detail`, `instance`, `invalid_params`). Fluent `ApiResponseBuilder` handles standard HTTP status responses (`Api.ok()`, `Api.created()`, `Api.validation()`).
6. **Idempotency, ETags & Request Correlation**:
   `IdempotencyMiddleware` prevents duplicate POST actions via `@ecfjs/cache`. `ETagMiddleware` calculates response hashes returning `304 Not Modified`. `CorrelationIdMiddleware` assigns `X-Request-ID` and `X-Correlation-ID`.
7. **API Profiles**:
   `Api.profile("mobile")` vs `Api.profile("desktop")` automatically applies device-tailored payload stripping and cursor pagination.
8. **GraphQL & gRPC Adapters**:
   Exposes marker interface adapters (`IGraphQLAdapter`, `IGRPCAdapter`) for future plugin integration.

## Consequences

### Positive
- Fully standardized, production-ready API execution pipeline out of the box.
- Zero-drift OpenAPI documentation generated directly from active routes.
- Built-in caching, ETags, Idempotency, and RFC-9457 error compliance.

### Negative
- Advanced OpenAPI schema generation requires metadata decoration on custom controller methods.
