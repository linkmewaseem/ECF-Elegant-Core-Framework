# `@ecf/auth` — Architecture Freeze Document (v1.0)

## Overview

`@ecf/auth` is the official Authentication & Authorization Platform for the ECF (Enterprise Core Framework) ecosystem. It provides a driver-based, modular, and security-hardened foundation for modern Node.js applications.

---

## 1. Monorepo Dependency Graph

```
@ecf/core
    │
@ecf/support
    │
@ecf/events
    │
@ecf/config
    │
@ecf/cache
    │
@ecf/database
    │
@ecf/auth (Milestone 15)
    │
@ecf/http
```

`@ecf/auth` hard-requires only `@ecf/core` and `@ecf/support`. All other framework packages (`@ecf/events`, `@ecf/config`, `@ecf/cache`, `@ecf/database`, `@ecf/http`) act as optional integration peers. There are **zero cyclic dependencies**.

---

## 2. Directory Structure

```
packages/auth/
 ├── ARCHITECTURE.md
 ├── README.md
 ├── package.json
 └── src/
      ├── contracts/
      │    ├── IAuthContext.js
      │    ├── IAuthManager.js
      │    ├── IGuard.js
      │    ├── IUserProvider.js
      │    ├── IAuthenticatable.js
      │    ├── IPasswordBroker.js
      │    ├── IHasher.js
      │    ├── IGate.js
      │    ├── IPolicy.js
      │    ├── IPermissionResolver.js
      │    ├── ITokenIssuer.js
      │    ├── ITokenVerifier.js
      │    ├── ITokenStore.js
      │    ├── ISessionRepository.js
      │    ├── IRememberTokenRepository.js
      │    ├── IPasswordResetTokenRepository.js
      │    ├── IMultiFactorProvider.js
      │    ├── IRecoveryCodeStore.js
      │    ├── IKeyProvider.js
      │    └── IAuthenticationRateLimiter.js
      ├── authentication/
      │    ├── AuthManager.js
      │    ├── GuardManager.js
      │    ├── guards/
      │    │    ├── BaseGuard.js
      │    │    ├── SessionGuard.js
      │    │    ├── TokenGuard.js
      │    │    ├── JwtGuard.js
      │    │    ├── ApiKeyGuard.js
      │    │    ├── SignedUrlGuard.js
      │    │    └── CustomGuard.js
      │    ├── providers/
      │    │    ├── MemoryUserProvider.js
      │    │    └── OrmUserProvider.js
      │    ├── passwords/
      │    │    ├── PasswordHasher.js
      │    │    └── PasswordBroker.js
      │    ├── sessions/
      │    │    ├── SessionManager.js
      │    │    └── RememberMeManager.js
      │    └── tokens/
      │         ├── JwtTokenService.js
      │         └── ApiKeyService.js
      ├── authorization/
      │    ├── Gate.js
      │    ├── PolicyManager.js
      │    └── PermissionResolver.js
      ├── mfa/
      │    ├── MfaManager.js
      │    ├── TotpProvider.js
      │    └── RecoveryCodeProvider.js
      ├── exceptions/
      │    └── AuthException.js
      ├── facades/
      │    ├── AuthFacade.js
      │    └── GateFacade.js
      ├── providers/
      │    └── AuthServiceProvider.js
      ├── testing/
      │    └── AuthTestingHelper.js
      └── integrations/
           └── http/
                ├── AuthMiddleware.js
                ├── GuestMiddleware.js
                └── HttpMiddlewareAdapters.js
```

---

## 3. Security Architecture & Guarantees

1. **Versioned Password Hashing**: `$ecf$<algo>$v=...$<salt>$<hash>` format with native `scrypt` default, native `Argon2id` support, `PBKDF2` FIPS option, constant-time `crypto.timingSafeEqual` comparison, and transparent rehash via `needsRehash()`.
2. **Hardened JWT Engine**: Strict algorithm allowlist (`HS256`, `RS256`, `EdDSA`), permanent rejection of `none`, `kid`-based key rotation, max payload limit, clock skew leeway, Base64URL strict decoding, and revocation check via `ITokenStore`.
3. **Session Subsystem**: Session ID rotation on authentication and privilege changes, idle/absolute lifetimes, server-side session invalidation, HttpOnly/SameSite/Secure cookie defaults.
4. **Selector/Verifier Remember Tokens**: Cookie holds `selector.verifier`, store holds `selector`, `hash(verifier)`. Verifier is rotated on every use; token reuse detection immediately revokes all remember tokens for the user.
5. **Enumeration-Safe Password Reset**: Raw token sent only to user, stored hashed in token repository, single-use with short expiry, rate-limited per account/IP.
6. **MFA Architecture**: Generic `IMultiFactorProvider` supporting RFC 6238 compliant `TotpProvider` with AES-encrypted secret storage and replayed step prevention, alongside `RecoveryCodeProvider` with single-use hashed codes.
7. **AsyncLocalStorage Context Isolation**: `AuthContext` ensures request-isolated authentication state across asynchronous callbacks and queues.

---

## 4. Performance Benchmarks

- **scrypt Hash + Verification**: ~400ms per 5 operations at production cost factor (16,384).
- **JWT Encode + Decode Throughput**: >3,000 ops/sec.
- **Gate Permission Check Throughput**: >30,000 ops/sec.
