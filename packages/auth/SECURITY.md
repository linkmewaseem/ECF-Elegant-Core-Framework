# `@ecfjs/auth` — Security Policy & Production Deployment Checklist

## Security Philosophy

`@ecfjs/auth` is engineered under the principle of **Zero-Trust Security by Default**. All authentication and authorization interfaces enforce strict boundaries, constant-time byte comparisons, and encrypted secrets.

---

## Threat Model & Controls Summary

| Threat Vector | Mitigation Strategy | Contract / Implementation |
| :--- | :--- | :--- |
| **Password Theft** | Versioned `$ecf$scrypt` or `$ecf$argon2id` hashes, timing-safe compare, automatic login rehash. | `PasswordHasher`, `IHasher` |
| **JWT Tampering & Key Confusion** | Explicit algorithm allowlist, permanent `none` rejection, `kid` key rotation, strict claim validation. | `JwtTokenService`, `JwtGuard` |
| **Session Fixation** | Mandatory session ID regeneration on login and privilege elevation. | `SessionGuard`, `SessionManager` |
| **Remember-Me Theft / Replay** | Selector/Verifier pattern (`selector.verifier`); full user token invalidation on replay detection. | `RememberMeManager` |
| **Password Reset Token Reuse** | Raw token issued only to user; SHA-256 token hash stored; single-use token purge; rate-limiting per IP/account. | `PasswordBroker` |
| **TOTP Code Replay** | RFC 6238 time-step tracking; replaying codes in same time step rejected; AES-256 encrypted secrets at rest. | `TotpProvider` |
| **Async Context Bleed** | Request state stored strictly inside Node.js `AsyncLocalStorage`. | `AuthContext` |

---

## Production Deployment Checklist

- [ ] **HTTPS Enforcement**: Ensure all authentication credentials, session cookies, and Bearer tokens are served exclusively over HTTPS.
- [ ] **Cookie Security**: Configure cookies with `HttpOnly`, `Secure`, and `SameSite=Lax` or `SameSite=Strict`.
- [ ] **JWT Secret Rotation**: Store JWT signing keys in environment variables or key vaults; pass key rotation resolvers via `IKeyProvider`.
- [ ] **TOTP Encryption**: Define `encryptionKey` option in `TotpProvider` to encrypt 2FA secrets at rest.
- [ ] **Rate Limiting**: Enable `IAuthenticationRateLimiter` on login, password reset, and TOTP endpoints to prevent brute-force attacks.
