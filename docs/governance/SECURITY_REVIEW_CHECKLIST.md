# ECF — Security Review Checklist

This document defines the **formal security review checklist** that must be completed for each ECF package before release promotion.

---

## Universal Checklist (All Packages)

| # | Control | Description | Status |
|---|---|---|---|
| S1 | Input Validation | All public methods validate and sanitize input parameters | ☐ |
| S2 | Secret Handling | No hardcoded secrets, API keys, or credentials in source | ☐ |
| S3 | Error Messages | Error responses do not leak stack traces, paths, or internal state in production | ☐ |
| S4 | Dependency Audit | No known CVEs in direct dependencies (`pnpm audit`) | ☐ |
| S5 | Export Surface | Internal modules not exposed via `package.json` exports | ☐ |
| S6 | Logging Safety | Logs do not contain passwords, tokens, or PII | ☐ |
| S7 | Timing Attacks | Cryptographic comparisons use `crypto.timingSafeEqual` | ☐ |
| S8 | Rate Limiting | Sensitive operations are rate-limited where applicable | ☐ |

---

## Package-Specific Checklists

### `@ecf/auth`

| # | Control | Status |
|---|---|---|
| A1 | JWT algorithm allowlist enforced; `none` permanently rejected | ☐ |
| A2 | Password hashing uses versioned envelope with production cost factors | ☐ |
| A3 | Session ID rotation on authentication and privilege escalation | ☐ |
| A4 | Remember-me tokens use selector/verifier with reuse detection | ☐ |
| A5 | MFA TOTP secrets encrypted at rest with replay protection | ☐ |
| A6 | AsyncLocalStorage context isolation verified with adversarial tests | ☐ |
| A7 | Password reset tokens are single-use, hashed, and rate-limited | ☐ |

### `@ecf/http`

| # | Control | Status |
|---|---|---|
| H1 | Request body size limits enforced by body parser | ☐ |
| H2 | Rate limiting middleware available and tested | ☐ |
| H3 | Cookie defaults: HttpOnly, SameSite, Secure in production | ☐ |
| H4 | Path traversal prevented in static file serving | ☐ |
| H5 | CORS configuration validated and documented | ☐ |
| H6 | Content-Type validation on JSON/form body parsers | ☐ |

### `@ecf/database`

| # | Control | Status |
|---|---|---|
| D1 | Parameterized queries only; no raw SQL concatenation | ☐ |
| D2 | Connection credentials not logged by query profiler | ☐ |
| D3 | SQL injection tests for query builder edge cases | ☐ |

### `@ecf/upload` / `@ecf/media` / `@ecf/storage`

| # | Control | Status |
|---|---|---|
| U1 | File type validation via magic bytes, not just extension | ☐ |
| U2 | Upload size limits enforced | ☐ |
| U3 | Path traversal prevented in file storage paths | ☐ |
| U4 | Signed URL expiration enforced | ☐ |

### `@ecf/queue`

| # | Control | Status |
|---|---|---|
| Q1 | Job payload HMAC signature verification enabled | ☐ |
| Q2 | Payload checksum validation on deserialization | ☐ |
| Q3 | Failed job repository does not expose sensitive payload data | ☐ |

### `@ecf/notifications` / `@ecf/broadcast`

| # | Control | Status |
|---|---|---|
| N1 | Webhook signature verification (HMAC) enforced | ☐ |
| N2 | Channel credentials encrypted in config | ☐ |

### `@ecf/ai`

| # | Control | Status |
|---|---|---|
| AI1 | API keys loaded from environment, never hardcoded | ☐ |
| AI2 | Content moderation available via `AI.moderate()` | ☐ |
| AI3 | Prompt injection mitigations documented | ☐ |
| AI4 | Token/cost telemetry does not log full prompts with PII | ☐ |

---

## Review Process

1. Package owner completes applicable checklist items.
2. Security reviewer validates with adversarial test suite where available.
3. Any failed item blocks release until resolved or explicitly waived with documented risk acceptance.
4. Completed checklist archived with release tag.

---

## Sign-Off

| Reviewer | Package | Date | Result |
|---|---|---|---|
| | | | Pass / Fail |
