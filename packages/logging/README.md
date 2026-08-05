# `@ecfjs/logging` — Enterprise Logging & Log Channels Platform

`@ecfjs/logging` is the enterprise-grade logging platform for ECF (Enterprise Core Framework). Combining the best features of Monolog, Laravel Logging, Winston, Pino, and OpenTelemetry, `@ecfjs/logging` provides channel configuration profiles, RFC5424 + Trace levels, lazy context evaluation, sensitive data masking, auto exception formatting, child loggers, batching, circuit breaking, exponential backoff retries, rotation policies (`daily`, `weekly`, `monthly`, `hourly`, `size`, `hybrid`), Gzip compression, storage offloading (`@ecfjs/storage`), search integration (`@ecfjs/search`), DevTools panel, and full OpenTelemetry trace/correlation ID propagation.

---

## 🌟 Key Features

- **Multi-Channel Drivers**: `memory`, `null`, `file`, `daily`, `stack`, `console`, `slack`, `discord`, `webhook`, `mail`, `elastic`, `loki`.
- **Channel Configuration Profiles**: Profile-driven setup via `logging.default` and `logging.channels`.
- **RFC5424 + Trace Log Levels**: `Emergency`, `Alert`, `Critical`, `Error`, `Warning`, `Notice`, `Info`, `Debug`, `Trace`.
- **Lazy Context Evaluation**: Evaluate context dynamically on write execution (`Log.withContext(() => ({ ... }))`).
- **Sensitive Data Masking**: Automatic redacting of `password`, `token`, `jwt`, `authorization`, `cookie`, `credit_card`, `cnic`, `secret`, `api_key` with `********`.
- **Exception Formatter**: Auto serializes Error objects into structured JSON with stacktraces, code, file, line, and cause.
- **Child Loggers**: Isolated request-bound child loggers via `Log.channel('api').withContext({ requestId })`.
- **Batch Logging**: Fluent atomic batching builder `Log.batch().add(...).flush()`.
- **Fault Tolerance**: Built-in Circuit Breaker and Exponential Backoff Retries (1s, 2s, 4s, 8s, 16s) for network sinks.
- **Advanced Log Rotation**: `daily`, `weekly`, `monthly`, `hourly`, `size`, `hybrid` policies + `.gz` compression + `@ecfjs/storage` cloud archiving.
- **OpenTelemetry Correlation**: Auto-propagation of `traceId`, `spanId`, `parentSpanId`, `correlationId`, `requestId`.
- **Testing Fake & DevTools**: `Log.fake()`, comprehensive assertions (`assertLogged`, `assertMasked`, etc.), and `LogCollector` for `@ecfjs/devtools`.

---

## 🚀 Quick Start

```js
import { Log } from '@ecfjs/logging';

// Write log via default stack channel
await Log.info('User completed checkout', { orderId: 4501, amount: 299 });

// Use specific channel
await Log.channel('slack').error('Payment gateway timeout');

// Stack channel multiplexing
await Log.stack(['daily', 'slack', 'elastic']).critical('Server out of memory');

// Lazy context
await Log.withContext(() => ({ userId: auth.user()?.id }), async () => {
  await Log.info('Action performed');
});

// Child logger
const logger = Log.channel('api').withContext({ requestId: 'req_xyz' });
await logger.info('API request started');

// Testing Fake
const fake = Log.fake();
await Log.info('Test event', { password: 'secret' });
fake.assertLogged('info', 'Test event');
fake.assertMasked('password');
```

---

## 📄 License

MIT Licensed.
