# `@ecfjs/mail` — Enterprise Mail & Communication Platform

`@ecfjs/mail` is the official mail and communication platform for the ECF (Enterprise Core Framework) ecosystem.

---

## Features

- ✉️ **Multi-Transport Engine**: Memory, Log, Null, SMTP, Resend, Mailgun, Failover, LoadBalancer.
- 🎨 **Markdown & Automatic CSS Inlining**: Markdown template compilation with automatic inline CSS generation for HTML email clients.
- 📎 **Attachments & CID Images**: Attachments from `@ecfjs/storage` disks, Buffer, Stream, or Path. Embedded Content-ID (`cid:key`) images.
- 🔄 **Background Queue Integration**: Asynchronous email delivery via `@ecfjs/queue` (`mailable.queue()`).
- 🧪 **Mail Testing Fake**: `Mail.fake()`, `assertSent()`, `assertQueued()`, `assertSentTo()`.
- 🖥️ **Sandbox Preview Server**: `MailSandboxServer` for local email previewing during development.

---

## Quick Start

### 1. Creating a Mailable

```javascript
import { Mailable } from "@ecfjs/mail";

export class WelcomeUserMail extends Mailable {
  constructor(userName) {
    super();
    this.subject("Welcome to ECF Framework!");
    this.markdown("emails.welcome", { userName });
  }
}

// Send mail immediately
await Mail.to("user@example.com").send(new WelcomeUserMail("Waseem"));

// Queue mail in background
await Mail.to("user@example.com").queue(new WelcomeUserMail("Waseem"));
```

### 2. Testing Fake

```javascript
import { Mail } from "@ecfjs/mail";

const fakeMail = Mail.fake();

await Mail.to("user@example.com").send(new WelcomeUserMail("Waseem"));

fakeMail.assertSent(WelcomeUserMail);
```

---

## License

MIT
