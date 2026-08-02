# Enterprise Services Documentation (`@ecf/auth`, `@ecf/queue`, `@ecf/cache`, `@ecf/mail`, `@ecf/storage`, `@ecf/media`, `@ecf/broadcast`, `@ecf/notifications`, `@ecf/scheduler`)

ECF provides first-party drivers and managers for background queues, email delivery, file storage, media processing, real-time broadcasting, and task scheduling.

---

## ⚡ Background Queues (`@ecf/queue`)

```js
import { Queue } from "@ecf/queue";

await Queue.dispatch(new SendWelcomeEmailJob({ userId: 101 }));
```

---

## 🔒 Authentication & RBAC (`@ecf/auth`)

```js
import { Auth } from "@ecf/auth";

const token = await Auth.attempt({ email: "user@example.com", password: "secret" });
```

---

## 📄 License
MIT Licensed.
