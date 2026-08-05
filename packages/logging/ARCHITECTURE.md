# Architecture Decision Record (ADR) — `@ecfjs/logging`

## Status
Approved & Implemented

## Context
ECF required a full-stack, enterprise-grade logging and log channel platform capable of supporting multi-channel sinks, high throughput, zero-overhead lazy context evaluation, automatic data redaction, fault isolation, rotation/archiving, searchability, and seamless correlation with `@ecfjs/observability`, `@ecfjs/devtools`, `@ecfjs/search`, `@ecfjs/mail`, and `@ecfjs/storage`.

## Decisions

1. **Pipeline Architecture**: Every log entry flows through a defined pipeline: Level Filter & Sampling Rules ➔ Context Resolution (Lazy & OpenTelemetry) ➔ Sensitive Data Masking ➔ Processors ➔ Formatter ➔ Driver / Circuit Breaker / Retry.
2. **Driver Capability Matrix**: All log drivers implement `getCapabilities()` returning boolean flags for `supportsJson`, `supportsBatch`, `supportsRetry`, `supportsRotation`, `supportsCompression`, `supportsArchive`.
3. **Fault Tolerance**: Network transport drivers (Slack, Discord, Webhook, Elastic, Loki, Mail) incorporate a Circuit Breaker and Exponential Backoff Retry policy to guarantee remote outages never freeze main application threads.
4. **Context & OpenTelemetry**: Node `AsyncLocalStorage` is utilized for execution context (`LogContext`), automatically merging active OpenTelemetry trace IDs (`traceId`, `spanId`, `correlationId`).
5. **Data Protection**: `LogMasker` recursively checks context keys against a configurable dictionary (`password`, `token`, `jwt`, `credit_card`, `cnic`, `api_key`, etc.) and redacts them with `********`.
6. **Testing & Observability**: Dedicated `LogFake` provided for unit test assertions (`assertLogged`, `assertMasked`, `assertCount`), and `LogCollector` integrated into `@ecfjs/devtools`.

## Consequences
Provides ECF with a 10/10 production-ready logging ecosystem matching Laravel, Monolog, Winston, Pino, and OpenTelemetry standards.
