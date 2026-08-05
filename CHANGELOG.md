# Changelog

All notable changes to **ECF (Enterprise Core Framework)** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-rc.1] - 2026-08-03

### Added
- **Core Subsystem**: `@ecfjs/core`, `@ecfjs/support`, `@ecfjs/config`, `@ecfjs/events`, `@ecfjs/contracts` (PSR-11 IoC Container, Dot-Notation Config, Lifecycle Event Bus).
- **HTTP Subsystem**: `@ecfjs/http`, `@ecfjs/validation`, `@ecfjs/view` (Express/Fastify/PSR-7 Router, Pipeline Validation Engine, Template Rendering).
- **Database & ORM**: `@ecfjs/database` (Eloquent Active Record Models, Schema Builder, Timestamped Migrations, Seeders).
- **Enterprise Services**: `@ecfjs/auth`, `@ecfjs/queue`, `@ecfjs/cache`, `@ecfjs/mail`, `@ecfjs/storage`, `@ecfjs/media`, `@ecfjs/broadcast`, `@ecfjs/notifications`, `@ecfjs/scheduler` (Guards, JWT, Sync/Memory/Database/Redis Queue, Stampede Protection Cache, Resend REST API & SMTP Mail, Local/S3 Storage, Image/Audio/Video Processing, Realtime WebSockets, Multi-channel Alerts, Cron Scheduler).
- **API Platform & Search**: `@ecfjs/api`, `@ecfjs/search` (Automated OpenAPI Generator, API Resources, Vector/Full-text Search Engine).
- **Logging Subsystem**: `@ecfjs/logging` (12 Drivers, Multi-channel Rotation, Gzip Compression, OpenTelemetry Tracing, Sensitive Data Redaction).
- **Testing Infrastructure**: `@ecfjs/testing` (DI Test Context Runner, Transaction Sandbox, HTTP/DB Assertions, Model Factories, Time Travel, Playwright Browser Agent, Performance Benchmark Engine, Snapshot Testing, Single-Source Fake Orchestrator).
- **DevKit Platform**: `@ecfjs/devkit` (`ecf new`, `ecf make:*`, AST Code Injection Engine, YAML Blueprint Compiler, `ecf validate`, `ecf architecture`, `ecf doctor`, `ecf undo`).
- **AI Engine Platform**: `@ecfjs/ai` (8 Drivers: OpenAI, Anthropic, Gemini, Ollama, OpenRouter, Groq, Memory, Null; Streaming API, Conversation Memory, Versioned Prompts, Modular RAG & ReRanker Pipeline, Autonomous Tool Agents, Model Context Protocol MCP Abstraction).
- **DevTools & Observability**: `@ecfjs/devtools`, `@ecfjs/observability` (Interactive Telescope-style Dashboard, OpenTelemetry Tracing).
- **Framework Freeze & Benchmarks**: Milestone 31 performance benchmarks (100k+ ops/sec baselines across IoC, Database, Queue, Search, AI).
- **Governance & CI/CD**: Added GitHub Actions workflow (`.github/workflows/ci.yml`), `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `LICENSE`, and official sample applications (`examples/rest-api`, `examples/realtime-chat`, `examples/ai-agent-rag`).
