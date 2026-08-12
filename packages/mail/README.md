# `@ecfjs/mail` — Enterprise Mail & Communication Platform

> **Stable Release — v1.0.0**  
> This package is production-ready and API-locked. No breaking changes will be made to public APIs without a major version increment.

`@ecfjs/mail` is the official mail and communication platform for the ECF (Enterprise Core Framework) ecosystem. It provides a transport-agnostic mailing system with native SMTP socket delivery, Resend REST API support, Mailable class abstractions, CSS-inlined Markdown templates, attachment integration, background queue delivery, and a full testing fake.

---

## Table of Contents

- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Mail Configuration File](#mail-configuration-file)
- [Transports](#transports)
- [Creating a Mailable](#creating-a-mailable)
- [Sending Email](#sending-email)
- [Setting the Sender (`from`)](#setting-the-sender-from)
- [Content: HTML, Markdown, and Views](#content-html-markdown-and-views)
- [Attachments](#attachments)
- [Background Queue Delivery](#background-queue-delivery)
- [Testing — Mail Fake](#testing--mail-fake)
- [Sandbox Preview Server](#sandbox-preview-server)
- [API Reference](#api-reference)
- [License](#license)

---

## Installation

```bash
# Already included in the ECF monorepo workspace
# For standalone use:
npm install @ecfjs/mail
```

**Peer dependencies (optional integrations):**
- `@ecfjs/queue` — required for `mailable.queue()` background delivery
- `@ecfjs/storage` — required for `Attachment.fromStorage()`
- `@ecfjs/view` — required for `.view("emails.welcome", data)` template rendering
- `@ecfjs/events` — required for mail event hooks

---

## Environment Configuration

Configure your mailer entirely through environment variables in your `.env` file:

```env
# Which transport to use: smtp | log | memory | null | resend
MAIL_MAILER=smtp

# SMTP server settings (e.g. Mailtrap sandbox)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls

# Default sender identity
MAIL_FROM_ADDRESS="no-reply@yourapp.com"
MAIL_FROM_NAME="Your App Name"
```

> **Mailtrap Sandbox** — use `MAIL_MAILER=smtp` with the Mailtrap credentials shown in your Mailtrap inbox settings to capture all outgoing mail during development without sending real emails.

---

## Mail Configuration File

Create `config/mail.js` in your application to declare all mailer settings:

```javascript
export default {
    default: process.env.MAIL_MAILER || "log",

    mailers: {
        smtp: {
            transport: "smtp",
            host:       process.env.MAIL_HOST       || "127.0.0.1",
            port:       process.env.MAIL_PORT        || 2525,
            username:   process.env.MAIL_USERNAME    || null,
            password:   process.env.MAIL_PASSWORD    || null,
            encryption: process.env.MAIL_ENCRYPTION  || null,
        },
        log: {
            transport: "log",
        },
        memory: {
            transport: "memory",
        },
    },

    from: {
        address: process.env.MAIL_FROM_ADDRESS || "hello@yourapp.com",
        name:    process.env.MAIL_FROM_NAME    || "Your App",
    },
};
```

Register the config and service provider in your bootstrap:

```javascript
import { MailServiceProvider } from "@ecfjs/mail";
import mailConfig from "../config/mail.js";

// Inside createApp()
app.configure({ mail: mailConfig });
app.register(MailServiceProvider);
```

The `MailServiceProvider` automatically reads `mail.default` and `mail.mailers.smtp` at boot time and configures the `MailManager` correctly — no manual wiring needed.

---

## Transports

| Driver     | Class               | Description                                               |
|------------|---------------------|-----------------------------------------------------------|
| `smtp`     | `SmtpTransport`     | Native TCP socket SMTP with `AUTH LOGIN`, STARTTLS-ready |
| `resend`   | `ResendTransport`   | Resend.com REST API                                       |
| `log`      | `LogTransport`      | Logs email payload to console (development default)       |
| `memory`   | `MemoryTransport`   | Stores emails in-memory (integration testing)             |
| `null`     | `NullTransport`     | Discards all emails silently                              |
| failover   | `FailoverTransport` | Tries primary, falls back to backup on failure            |

### SMTP Transport — Connection Details

`SmtpTransport` implements a pure Node.js TCP socket SMTP client (`node:net`). It:

1. Connects to the configured host/port
2. Performs `EHLO localhost`
3. Authenticates via **`AUTH LOGIN`** (base64 username + password)
4. Issues `MAIL FROM`, `RCPT TO`, `DATA`
5. Sends a fully-formed MIME email (HTML, `Content-Type: text/html; charset=utf-8`)
6. Issues `QUIT` and cleans up the socket

```javascript
import { SmtpTransport } from "@ecfjs/mail";

const transport = new SmtpTransport({
    host:       "sandbox.smtp.mailtrap.io",
    port:       2525,
    username:   "your_username",
    password:   "your_password",
    encryption: "tls",     // optional
});
```

---

## Creating a Mailable

Create a class that extends `Mailable` to encapsulate each type of email your application sends:

```javascript
import { Mailable } from "@ecfjs/mail";

export class WelcomeMail extends Mailable {
    constructor(user) {
        super();
        // Sender — reads MAIL_FROM_ADDRESS from .env
        this.from(process.env.MAIL_FROM_ADDRESS || "no-reply@yourapp.com");
        // Subject
        this.subject("Welcome to the Platform!");
        // Content — HTML inline, no web links
        this.html(`
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>Hello, ${user.name}!</h2>
                <p>Your account has been created successfully.</p>
                <p>If you have any questions, please contact support.</p>
            </div>
        `);
    }
}
```

You can also use Markdown templates:

```javascript
export class InvoiceMail extends Mailable {
    constructor(invoice) {
        super();
        this.from("billing@yourapp.com");
        this.subject(`Invoice #${invoice.id}`);
        this.markdown("emails.invoice", { invoice });  // resolves via @ecfjs/view
    }
}
```

---

## Sending Email

### Send Immediately

```javascript
import { Mail } from "@ecfjs/mail";
import { WelcomeMail } from "../Mail/WelcomeMail.js";

// In a Controller or Service
await Mail.to(user.email).send(new WelcomeMail(user));
```

### Send to Multiple Recipients

```javascript
await Mail.to(["alice@example.com", "bob@example.com"]).send(new NoticeMail(data));
```

### With CC and BCC

```javascript
const mail = new ReportMail(report);
mail.cc("manager@example.com");
mail.bcc("audit@example.com");
await Mail.to("user@example.com").send(mail);
```

### Queue in Background

```javascript
await Mail.to(user.email).queue(new WelcomeMail(user));

// Queue with delay (seconds)
await Mail.to(user.email).queue(new WelcomeMail(user), "emails");
```

---

## Setting the Sender (`from`)

Set the sender address inside your Mailable constructor (recommended):

```javascript
this.from(process.env.MAIL_FROM_ADDRESS || "no-reply@yourapp.com");
```

Or set it dynamically when sending:

```javascript
const mail = new WelcomeMail(user);
mail.from("custom-sender@yourapp.com");
await Mail.to(user.email).send(mail);
```

> **Do NOT include `<a href="...">` links in the email body** if the intent is to send a link-free notification. Use plain text or display only the token/code for the user to act on.

---

## Content: HTML, Markdown, and Views

### Inline HTML

```javascript
this.html("<h1>Hello!</h1><p>Your account is ready.</p>");
```

### Markdown Template (with auto CSS-inlining)

```javascript
// Compiles emails/welcome.md + inlines CSS
this.markdown("emails.welcome", { user });
```

### View Template

```javascript
// Renders emails/invoice.ecf view
this.view("emails.invoice", { invoice });
```

---

## Attachments

```javascript
import { Attachment } from "@ecfjs/mail";

// From file path
const pdf = Attachment.fromPath("/var/reports/invoice.pdf");

// From Buffer
const csv = Attachment.fromBuffer(Buffer.from("id,name\n1,Alice"), "export.csv");

// From @ecfjs/storage disk
const stored = await Attachment.fromStorage(storage, "invoices/inv_001.pdf", "local");

mail.attach(pdf);
mail.attach(csv);
mail.attach(stored);
```

---

## Background Queue Delivery

Queue mail for background delivery via `@ecfjs/queue`:

```javascript
// Queue for immediate background delivery
await Mail.to(user.email).queue(new WelcomeMail(user));

// Queue with specific queue name
await new WelcomeMail(user).to(user.email).queue("emails");
```

---

## Testing — Mail Fake

Intercept all outgoing mail in tests without connecting to any SMTP server:

```javascript
import { Mail } from "@ecfjs/mail";

test("sends welcome email on registration", async () => {
    const fakeMail = Mail.fake();

    await registerUser({ name: "Waseem", email: "waseem@example.com" });

    // Assert mail was sent
    fakeMail.assertSent(WelcomeMail);

    // Assert sent to specific recipient
    fakeMail.assertSentTo("waseem@example.com");

    // Assert queued
    fakeMail.assertQueued(InvoiceMail);

    // Assert nothing was sent
    fakeMail.assertNothingSent();
});
```

---

## Sandbox Preview Server

Preview outgoing emails in a browser during development without any external service:

```javascript
import { MailSandboxServer } from "@ecfjs/mail";

const sandbox = new MailSandboxServer({ port: 4000 });
sandbox.listen();
// Open http://localhost:4000 to preview captured emails
```

---

## API Reference

### `Mail` Facade

| Method                  | Returns             | Description                                    |
|-------------------------|---------------------|------------------------------------------------|
| `Mail.to(recipients)`   | `MailDispatcher`    | Set recipient(s) — string or array             |
| `.send(mailable)`       | `Promise<result>`   | Send immediately via configured transport      |
| `.queue(mailable)`      | `Promise<void>`     | Queue for background delivery                  |
| `Mail.mailer(name)`     | `IMailTransport`    | Resolve a specific named transport             |
| `Mail.fake()`           | `MailTestingFake`   | Replace transport with in-memory test fake     |

### `Mailable` Builder Methods

| Method                       | Description                                      |
|------------------------------|--------------------------------------------------|
| `from(address)`              | Set the sender address                           |
| `to(recipients)`             | Set recipients (string or array)                 |
| `cc(recipients)`             | Set CC recipients                                |
| `bcc(recipients)`            | Set BCC recipients                               |
| `subject(text)`              | Set the subject line                             |
| `html(htmlString)`           | Set HTML body directly                           |
| `view(viewName, data)`       | Set body via ECF view template                   |
| `markdown(viewName, data)`   | Set body via Markdown (auto CSS-inlined)         |
| `attach(attachment)`         | Attach a file or buffer                          |
| `queue(queueName?)`          | Dispatch to background queue                     |
| `later(delaySeconds, queue)` | Delayed background delivery                      |
| `envelope()`                 | Returns the `Envelope` value object              |
| `content()`                  | Returns the `Content` value object               |
| `attachments()`              | Returns the attachments array                    |

### `Envelope` Fields

| Field      | Type          | Description                |
|------------|---------------|----------------------------|
| `from`     | `string`      | Sender address             |
| `to`       | `string[]`    | Recipients                 |
| `cc`       | `string[]`    | CC recipients              |
| `bcc`      | `string[]`    | BCC recipients             |
| `replyTo`  | `string`      | Reply-To address           |
| `subject`  | `string`      | Subject line               |
| `tags`     | `string[]`    | Metadata tags              |
| `metadata` | `object`      | Arbitrary key-value data   |

### `Content` Fields

| Field      | Type     | Description                          |
|------------|----------|--------------------------------------|
| `html`     | `string` | Raw HTML body                        |
| `text`     | `string` | Plain text fallback                  |
| `view`     | `string` | View name for template rendering     |
| `markdown` | `string` | Markdown view name                   |
| `data`     | `object` | Template data variables              |

---

## Known Bugs Fixed in v1.0.0

| Bug | Fix |
|-----|-----|
| `mailable.to is not a function` when passing a string view name to `Mail.to().send()` | `MailManager.to().send()` now normalises strings, plain objects, and Mailable instances automatically |
| `To: <>` — empty recipient in delivered email | `MailMessage` constructor now uses existing `Envelope`/`Content` instances directly instead of re-wrapping (field-by-field re-copy was silently dropping `to`) |
| SMTP transport was a stub (returned fake success without connecting) | `SmtpTransport` now implements a real TCP socket SMTP client with `AUTH LOGIN` |
| `MailManager.defaultMailer` hardcoded to `"memory"`, ignoring `MAIL_MAILER` env var | `MailServiceProvider.boot()` now reads app config and sets `defaultMailer` + pre-warms the transport |

---

## License

MIT — © Muhammad Waseem
