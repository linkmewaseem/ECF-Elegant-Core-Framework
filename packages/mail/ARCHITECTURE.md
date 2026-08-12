# `@ecfjs/mail` — Architecture & Stability Freeze Document

> **STABLE — v1.0.0 | API LOCKED**  
> This document records the final, production-ready architecture of `@ecfjs/mail`.  
> **No breaking changes** will be made to any public API, transport interface, or Mailable contract without a new major version (`v2.x.x`).

---

## 1. Package Identity

| Property    | Value                                       |
|-------------|---------------------------------------------|
| Package     | `@ecfjs/mail`                               |
| Version     | `1.0.0` (Stable)                            |
| Milestone   | ECF Milestone 19                            |
| Author      | Muhammad Waseem                             |
| License     | MIT                                         |
| Node.js     | `>= 22`                                     |
| Module Type | ESM (`"type": "module"`)                    |
| Status      | 🟢 **PRODUCTION STABLE — API LOCKED**       |

---

## 2. Monorepo Dependency Graph

```
@ecfjs/core
    │
    ├── @ecfjs/support
    │
    └── @ecfjs/queue
            │
        @ecfjs/mail  (Milestone 19)
```

**Hard dependencies:** `@ecfjs/core`, `@ecfjs/support`, `@ecfjs/queue`

**Optional peer integrations:**

| Package          | Integration Purpose                        |
|------------------|--------------------------------------------|
| `@ecfjs/config`  | Mail config resolution via `ConfigManager` |
| `@ecfjs/events`  | Mail event hooks                           |
| `@ecfjs/view`    | View-based email templates                 |
| `@ecfjs/storage` | Attachment disk integration                |

There are **zero cyclic dependencies** in this package.

---

## 3. Directory Structure

```
packages/mail/src/
├── contracts/
│   ├── IMailManager.js          # Abstract MailManager contract
│   ├── IMailer.js               # Abstract Mailer contract
│   ├── IMailTransport.js        # Abstract Transport interface
│   ├── IMailable.js             # Abstract Mailable contract
│   └── ICssInliner.js           # Abstract CSS Inliner contract
│
├── mailable/
│   ├── Mailable.js              # Fluent email builder base class
│   ├── Envelope.js              # Value object: from, to, cc, bcc, subject, tags
│   ├── Content.js               # Value object: html, text, view, markdown, data
│   └── SendQueuedMailableJob.js # Queue job handler for background delivery
│
├── internal/
│   ├── MailManager.js           # Core mail dispatcher (IoC singleton "mail")
│   └── MailMessage.js           # Final assembled message passed to transport
│
├── transports/
│   ├── MemoryTransport.js       # In-memory capture (testing/dev)
│   ├── LogTransport.js          # Console logger + NullTransport
│   ├── FailoverTransport.js     # Primary → backup fallback + LoadBalancedTransport
│   └── ResendTransport.js       # ResendTransport (REST API) + SmtpTransport (TCP socket)
│
├── markdown/
│   ├── MarkdownCompiler.js      # Compiles .md templates to HTML
│   └── SimpleCssInliner.js      # Inlines CSS rules into HTML email elements
│
├── attachments/
│   └── Attachment.js            # Attachment builder (path, buffer, storage disk)
│
├── sandbox/
│   └── MailSandboxServer.js     # Local dev preview HTTP server
│
├── exceptions/
│   └── MailException.js         # TransportException, MailableException
│
├── facades/
│   └── MailFacade.js            # `Mail` static facade (resolves from IoC container)
│
├── providers/
│   └── MailServiceProvider.js   # Registers & boots MailManager + SmtpTransport
│
└── testing/
    └── MailTestingFake.js       # Mail.fake() — assertSent / assertQueued / assertNothingSent
```

---

## 4. Delivery Pipeline

```
Application Code
  Mail.to("user@example.com").send(new WelcomeMail(user))
                      │
                      ▼
            ┌─────────────────────┐
            │   MailFacade        │  resolves "mail" from IoC container
            └────────┬────────────┘
                     │
                     ▼
            ┌─────────────────────┐
            │   MailManager       │  .to(recipients) → returns dispatcher
            │   .defaultMailer    │  set by MailServiceProvider.boot()
            └────────┬────────────┘
                     │
          ┌──────────▼──────────┐
          │   Mailable          │  .from() .subject() .html() / .markdown()
          │   .to(recipients)   │  sets Envelope.to = ["user@example.com"]
          │   .envelope()       │  returns Envelope value object
          │   .content()        │  returns Content value object
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │   MailMessage       │  assembles Envelope + Content + Attachments
          │                     │  (uses instances directly — no re-wrapping)
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │   SmtpTransport     │  reads envelope.from / envelope.to / envelope.subject
          │   (TCP socket)      │  reads content.html / content.text
          │                     │  performs: EHLO → AUTH LOGIN → MAIL FROM →
          │                     │            RCPT TO → DATA → QUIT
          └──────────┬──────────┘
                     │
                     ▼
              📬 SMTP Server
          (Mailtrap / Mailgun / etc.)
```

---

## 5. Key Design Decisions (Locked)

### 5.1 `MailMessage` — No Re-Wrapping Rule

`MailMessage` receives `Envelope` and `Content` instances from `Mailable.envelope()` / `Mailable.content()`. It must **use them directly** — not re-construct them:

```javascript
// ✅ CORRECT — preserves all data including .to, .from, .subject
this.envelope = (data.envelope instanceof Envelope)
  ? data.envelope
  : new Envelope(data.envelope || {});
```

**Rationale:** Re-wrapping with `new Envelope(existingEnvelope)` copies fields individually. If `to` is set after construction (via `instance.to(recipients)`) and the original reference is then re-copied, stale/empty data can be captured. Direct reference passing eliminates this entirely.

### 5.2 `SmtpTransport` — Envelope/Content Normalisation

`SmtpTransport.send(mailMessage)` normalises `MailMessage`'s nested structure at the start of every send:

```javascript
const env = (mailMessage.envelope instanceof Object) ? mailMessage.envelope : mailMessage;
const cnt = (mailMessage.content  instanceof Object) ? mailMessage.content  : mailMessage;

const fromAddr = env.from || process.env.MAIL_FROM_ADDRESS;
const toList   = Array.isArray(env.to) ? env.to : (env.to ? [env.to] : []);
const subject  = env.subject || "No Subject";
const bodyHtml = cnt.html || cnt.text || "";
```

This supports both `MailMessage` instances (nested) and plain objects (flat), making the transport forward-compatible.

### 5.3 `MailServiceProvider.boot()` — Config-Driven Initialisation

The service provider is responsible for reading app config at boot time and configuring the `MailManager`. This is intentional — neither the `MailManager` constructor nor the Facade should resolve config themselves:

```javascript
boot(app) {
    const manager = app.make("mail");
    const cfg = app.make("config").get("mail") || {};
    const defaultMailer = cfg.default || process.env.MAIL_MAILER || "log";
    manager.defaultMailer = defaultMailer;

    if (defaultMailer === "smtp") {
        manager.mailers.set("smtp", new SmtpTransport({ ...smtpCfg }));
    }
}
```

### 5.4 `MailManager.to()` — Mailable Normalisation

`MailManager.to(recipients).send(mailable)` accepts three forms:

| Input form                     | Handling                                      |
|--------------------------------|-----------------------------------------------|
| `mailable instanceof Mailable` | Used directly; `instance.to(recipients)` called |
| `mailable` is a class function | Instantiated with `new mailable(data)`        |
| `mailable` is a string         | Treated as view name; plain `Mailable` built  |
| `mailable` is a plain object   | Reads `.subject`, `.html`, `.view`, `.from`   |

---

## 6. Security Guarantees

| Protection                   | Implementation                                                              |
|------------------------------|-----------------------------------------------------------------------------|
| **Header Injection Shield**  | Newline (`\r\n`) characters stripped from `subject`, `to`, `cc`, and `bcc` |
| **Failover Resilience**      | `FailoverTransport` retries via backup on primary failure                   |
| **Load Balancing**           | `LoadBalancedTransport` distributes across multiple transports              |
| **Dev Isolation**            | `MemoryTransport` and `LogTransport` never make network calls               |
| **Test Isolation**           | `Mail.fake()` replaces all transports; no SMTP connections during tests     |

---

## 7. Performance Benchmarks (v1.0.0)

| Benchmark                       | Result                  |
|---------------------------------|-------------------------|
| `MemoryTransport` dispatch      | **> 54,000 ops/sec**    |
| Test suite (8 tests)            | **< 1,400 ms total**    |
| SMTP TCP socket connect + send  | **< 2 sec** (Mailtrap)  |

---

## 8. Test Coverage (v1.0.0)

| Test Suite                               | Status |
|------------------------------------------|--------|
| `MemoryTransport` throughput benchmark   | ✅ PASS |
| `MailQueueStorageIntegration`            | ✅ PASS |
| `HeaderInjectionSecurity`               | ✅ PASS |
| `MailTestingFake` assertions             | ✅ PASS |
| `Mailable` envelope/content builder     | ✅ PASS |
| `MarkdownCompiler` CSS inlining         | ✅ PASS |
| `MemoryTransport` capture               | ✅ PASS |
| `FailoverTransport & LoadBalancedTransport` | ✅ PASS |

All 8 tests pass. **Zero failures.**

---

## 9. Public API Surface (Locked at v1.0.0)

The following exports are **API-locked**. No breaking changes without a `v2.x.x` bump:

### Contracts (Interfaces)
- `IMailManager`
- `IMailer`
- `IMailTransport`
- `IMailable`
- `ICssInliner`

### Mailable System
- `Mailable` — builder base class
- `Envelope` — value object
- `Content` — value object
- `SendQueuedMailableJob` — queue job

### Transports
- `MemoryTransport`
- `LogTransport`, `NullTransport`
- `FailoverTransport`, `LoadBalancedTransport`
- `ResendTransport`
- `SmtpTransport`

### Internals (Stable)
- `MailManager`
- `MailMessage`

### Facades & Providers
- `Mail` (via `MailFacade`)
- `MailServiceProvider`

### Utilities
- `MarkdownCompiler`
- `SimpleCssInliner`
- `Attachment`
- `MailSandboxServer`
- `MailTestingFake`

### Exceptions
- `MailException`
- `TransportException`

---

## 10. Bug History & Fixes Applied Before Stable Release

| Issue | Root Cause | Fix Applied |
|-------|-----------|-------------|
| `mailable.to is not a function` | `MailManager.to().send()` didn't normalise string/plain-object mailables | Added Mailable normalisation in `MailManager.to().send()` |
| Emails silently swallowed | `SmtpTransport.send()` was a stub (returned fake success) | Implemented real TCP socket SMTP client |
| `MAIL_MAILER=smtp` ignored in browser | `MailManager.defaultMailer` hardcoded to `"memory"` | `MailServiceProvider.boot()` reads config and sets `defaultMailer` |
| `To: <>` empty recipient header | `MailMessage` re-wrapped `Envelope` via field-by-field copy, losing `.to` | `MailMessage` now uses `Envelope` instances directly (`instanceof` check) |

---

## 11. Stability Policy

> **This package is STABLE. API is LOCKED.**

- ✅ Bug fixes → patch version (`1.0.x`)  
- ✅ New optional features (non-breaking) → minor version (`1.x.0`)  
- ❌ Any breaking API change → requires major version (`2.0.0`) + migration guide  
- ❌ Existing method signatures must not change  
- ❌ Existing exported class names must not change  
- ❌ `Envelope`, `Content`, `Mailable` field names must not change  

---

*Architecture Freeze — August 2026 | Muhammad Waseem*
