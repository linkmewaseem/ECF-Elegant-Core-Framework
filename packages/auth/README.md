# `@ecf/auth` — Enterprise Authentication & Authorization Platform

`@ecf/auth` is an enterprise-grade authentication and authorization platform for the ECF (Enterprise Core Framework) ecosystem.

---

## Features

- 🔐 **Multiple Guards**: Session, Bearer Token, JWT, API Key, Signed URL, and Custom Guards.
- 🔑 **Password Hashing**: Versioned envelope (`$ecf$scrypt$...`, `$ecf$argon2id$...`, `$ecf$pbkdf2$...`) with transparent rehash on login.
- 🛡️ **Hardened JWT**: Explicit algorithm allowlist (`HS256`, `RS256`, `EdDSA`), permanent `none` rejection, `kid` key rotation, revocation checks.
- 🍪 **Session & Remember Me**: Session ID rotation, idle/absolute lifetimes, selector/verifier token rotation with theft detection.
- ⚡ **Authorization Engine**: `Gate` and `PolicyManager` supporting abilities, resource policies, `before`/`after` hooks, and role/permission resolvers.
- 📱 **Multi-Factor Authentication**: RFC 6238 TOTP with AES encrypted secrets, window tolerance, step replay protection, and single-use recovery codes.
- 🌐 **AsyncLocalStorage Isolation**: Isolated per-request auth context.
- 🌉 **Zero-Duplication HTTP Bridge**: Full backward compatibility with `@ecf/http`.

---

## Quick Start

### 1. Register AuthServiceProvider

```javascript
import { Application } from "@ecf/core";
import { AuthServiceProvider, Auth, Gate } from "@ecf/auth";

const app = new Application();
app.register(AuthServiceProvider);
app.boot();
```

### 2. User Authentication

```javascript
import { Auth } from "@ecf/auth";

// Attempt Login with credentials
const success = await Auth.attempt({ email: "alex@ecf.dev", password: "SecretPassword123" });

if (success) {
  console.log("Logged in user:", Auth.user());
  console.log("User ID:", Auth.id());
}
```

### 3. Password Hashing

```javascript
import { PasswordHasher } from "@ecf/auth";

const hasher = new PasswordHasher();
const hash = await hasher.make("MyPassword123!");

const isValid = await hasher.check("MyPassword123!", hash); // true
const needsRehash = hasher.needsRehash(hash); // false
```

### 4. Gates & Policies

```javascript
import { Gate } from "@ecf/auth";

const gate = new Gate();
gate.define("edit-post", (user, post) => user.id === post.userId);

const allowed = await gate.allows(user, "edit-post", post);
```

### 5. TOTP Two-Factor Authentication

```javascript
import { TotpProvider } from "@ecf/auth";

const totp = new TotpProvider();
const secretData = totp.generateSecret(user, "ECF App");

// Display QR code URI: secretData.uri
// Verify submitted 6-digit code:
const result = totp.verifyCode(secretData.encryptedSecret, "123456");
if (result.valid) {
  console.log("2FA verified!");
}
```

---

## License

MIT
