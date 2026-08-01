# `@ecf/contracts` — Zero-Runtime Ecosystem SDK Contracts

`@ecf/contracts` contains the official zero-runtime interface definitions for the ECF (Enterprise Core Framework) ecosystem.

---

## Included Contracts

- 🔐 `IAuthManager`, `IGuard`, `IUserProvider`
- ⚡ `ICacheManager`, `ICacheStore`
- 🔄 `IQueueManager`, `IQueueDriver`, `IJob`
- ✉️ `IMailManager`, `IMailer`, `IMailTransport`
- 📢 `INotificationManager`, `INotificationChannel`, `INotifiable`
- 💾 `IStorageManager`, `IFilesystem`, `IStorageDriver`

---

## Usage

```javascript
import { INotificationChannel } from "@ecf/contracts";

export class CustomTelegramChannel extends INotificationChannel {
  name() {
    return "telegram";
  }

  async send(notifiable, notification) {
    // Custom Telegram bot delivery logic
  }
}
```

---

## License

MIT
