# `@ecfjs/api`

Enterprise API Platform for ECF (Enterprise Core Framework).

## Features

- **API Resources & Collections**: Laravel-style transformation with conditional fields (`when`, `merge`, `whenLoaded`, `whenCounted`), sparse fieldsets (`?fields=...`), and include relations (`?include=...`).
- **Cursor & Offset Pagination**: Automatic pagination links and metadata (`data`, `links`, `meta`, `nextCursor`, `prevCursor`).
- **API Versioning**: Multi-strategy URI path (`/api/v1`), `Accept` header (`application/vnd.ecf.v2+json`), `X-Api-Version` header, and query param.
- **Granular Multi-Level Rate Limiting**: Per User, Token, IP, and Route rate limiters integrated with `@ecfjs/cache`.
- **OpenAPI 3.0 Spec & Swagger UI Generator**: Automatic route inspection building `openapi.json` / `swagger.json` and interactive Swagger UI dashboard at `/docs/api`.
- **RFC-9457 Problem Details Error Formatting**: Compliant error payloads (`type`, `title`, `status`, `detail`, `instance`, `invalid_params`).
- **ETag Caching & Idempotency**: Automatic `If-None-Match` -> `304 Not Modified` and `Idempotency-Key` POST duplicate prevention.
- **Request Correlation Tracing**: `X-Request-ID` and `X-Correlation-ID` headers linked to `@ecfjs/observability`.
- **API Profiles**: `Api.profile("mobile")` vs `Api.profile("desktop")` device-tailored payloads.
- **Fluent Response Builder**: `Api.ok()`, `Api.created()`, `Api.error()`, `Api.validation()`.
- **Testing Fake**: Rich assertions with `Api.fake()`.

## Usage

```javascript
import { Api, ApiResource } from "@ecfjs/api";

class UserResource extends ApiResource {
  toArray() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      posts: this.whenLoaded("posts", () => PostResource.collection(this.posts)),
    };
  }
}

// In Controller
export class UserController {
  async show(req, res) {
    const user = await User.find(req.params.id);
    return Api.ok(UserResource.make(user));
  }
}
```
