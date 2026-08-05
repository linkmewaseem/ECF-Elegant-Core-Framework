# Enterprise Services Documentation (`@ecfjs/auth`, `@ecfjs/queue`, `@ecfjs/cache`, `@ecfjs/mail`, `@ecfjs/storage`, `@ecfjs/media`, `@ecfjs/broadcast`, `@ecfjs/notifications`, `@ecfjs/scheduler`)

ECF provides first-party drivers and managers for background queues, email delivery, file storage, media processing, real-time broadcasting, and task scheduling.

---

## ⚡ Background Queues (`@ecfjs/queue`)

```js
import { Queue } from "@ecfjs/queue";

await Queue.dispatch(new SendWelcomeEmailJob({ userId: 101 }));
```

---

## 🔒 Authentication & RBAC (`@ecfjs/auth`)

```js
import { Auth } from "@ecfjs/auth";

const token = await Auth.attempt({ email: "user@example.com", password: "secret" });
```

---

## 📄 License
MIT Licensed.
