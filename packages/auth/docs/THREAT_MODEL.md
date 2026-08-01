# Architectural Threat Model — `@ecf/auth`

## 1. Overview & Trust Boundaries

The `@ecf/auth` subsystem operates at the security perimeter of ECF applications. The trust boundaries are structured as follows:

```
[ Unstrusted Client Request ]
             │
             ▼  (HTTP Headers / Cookies / Query Params)
 ┌─────────────────────────────────────────────────────────────┐
 │ Boundary 1: Authentication Middleware & Token Guards        │
 └───────────────────────────┬─────────────────────────────────┘
                             │
                             ▼  (Validated Authenticatable Entity)
 ┌─────────────────────────────────────────────────────────────┐
 │ Boundary 2: Isolated AuthContext (AsyncLocalStorage)        │
 └───────────────────────────┬─────────────────────────────────┘
                             │
                             ▼  (Authorized Actions & Policy Checks)
 ┌─────────────────────────────────────────────────────────────┐
 │ Boundary 3: Gate & Policy Authorization Engine             │
 └─────────────────────────────────────────────────────────────┘
```

---

## 2. Invariant Security Controls

1. **Default-Deny Authorization Model**: Gates and Policy checks evaluate to `false` unless explicitly granted by a registered callback or policy method.
2. **Constant-Time Verification**: All byte and string comparisons for hashes (`crypto.scryptSync`), signatures (`crypto.createHmac`), and reset/remember tokens use `crypto.timingSafeEqual`.
3. **No Unsafe Fallbacks**: Algorithms like `none` in JWT or raw unhashed reset tokens in persistent storage are explicitly disallowed by design.
