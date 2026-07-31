# ECF — Framework Performance Contract & SLAs

This document defines the official **Performance Service Level Agreements (SLAs)** and benchmark thresholds for the ECF (Elegant Core Framework) ecosystem.

---

## ⚡ Framework SLAs & Target Benchmarks

| Component / Engine | Key Metric | Target SLA Benchmark | Target Metric Description |
|---|---|---|---|
| **HTTP Transport Engine (`@ecf/http`)** | **Throughput** | **`> 300,000 req/sec`** | High-concurrency throughput on standard HTTP routing with zero-copy Trie matching. |
| **View Engine (`@ecf/view`)** | **Compilation Speed** | **`< 10ms`** | Warm compilation time for complex nested templates with expression evaluation. |
| **ORM Hydration (`@ecf/database`)** | **Hydration Speed** | **`> 6,000,000 records/sec`** | Active Record + Data Mapper entity instantiation speed from raw SQL query results. |
| **Database Caching (`@ecf/database`)** | **Cache Hit Ratio** | **`> 99%`** | Prepared AST statement and relation caching hit rate on repeat query execution. |
| **CLI Tooling (`@ecf/cli` & `@ecf/console`)**| **Startup Latency** | **`< 200ms`** | Complete cold-start execution time from command invocation to output render. |
| **IoC Container (`@ecf/core`)** | **Resolution Latency** | **`< 0.05ms`** | Singleton and transient dependency resolution time from container registry. |

---

## 📊 Benchmark Verification Standard

All performance claims are validated using standard monorepo benchmark scripts under `tools/benchmarks/`:

1. **HTTP Pipeline**: Measured using `autocannon` / `wrk` with 100 concurrent connections over HTTP/1.1 loopback.
2. **View Engine**: Measured over 100,000 iterations using `performance.now()` precision timers.
3. **ORM Hydration**: Measured using 1,000,000 dataset batches with active attribute casting and dirty tracking.
4. **CLI Startup**: Measured using `time node bin/ecf.js --version` cold-start executions.

---

## 🚫 No Performance Regression Policy

- Any PR or commit that introduces a **> 5% performance degradation** on core benchmarks will fail the release pipeline quality gate and cannot be merged into `main`.
