# ECF Database Engine — Performance Contract & SLA v1.0

This document defines the strict performance specifications, throughput benchmarks, memory limits, and SLA targets for `@ecf/database v1.0 Stable`.

---

## 🎯 Locked Performance Targets & SLAs

### 1. Hydration Performance
- **Fast-Path Hydration (`hydrateRaw`)**: Must achieve **$\ge 200,000$ models/sec** on standard hardware (Node.js 20+, single thread).
- **Hydration Overhead**: Model instantiation overhead must remain **$< 5\%$** compared to raw POJO objects returned by underlying database drivers.

### 2. Compiled SQL Cache Efficiency
- **Cache Hit Rate**: Re-compiled AST execution must yield **$\ge 99\%$ AST cache hit rate** for repeated query structures.
- **Compilation Speedup**: Bypassing SQL compilation via `CompiledSqlCache` must achieve a **$3\times \text{ to } 5\times$ speedup** in query AST build times.

### 3. Prepared Statement Cache
- **Handle Reuse**: Connection-level prepared statement cache must achieve **$0\text{ms}$ query parsing overhead** on cached statements across multiple QueryBuilder invocations on the same connection.

### 4. IdentityMap & Memory Limits
- **Memory Growth Guard**: Model instances maintained in `IdentityMap` must be garbage-collectable via `WeakRef` / `FinalizationRegistry`.
- **Zero Memory Leaks**: Long-running background workers processing $\ge 1,000,000$ records must maintain stable heap memory without unbounded growth.

### 5. Cursor Pagination & Data Streaming Throughput
- **Offset Scan Immunity**: `cursorPaginate()` must maintain **$O(1)$ query execution time** regardless of offset size (e.g. 10th row vs 1,000,000th row).
- **Streaming Heap Footprint**: `stream()`, `lazy()`, and `each()` must operate within a bounded peak heap footprint of **$< 30\text{MB}$** even when processing multi-gigabyte datasets.

### 6. Query Profiler Overhead
- **Telemetry Penalty**: When Profiler / Event Stream is active in developer mode, the profiling overhead must remain **$< 3\%$** of total query execution time.
- **Production Zero-Overhead**: When Profiler is disabled, profiling hooks must evaluate to zero-cost no-op checks.

---

## 📊 Benchmark Verification Methodology

All performance goals will be validated using the automated test suite in `packages/database/tests/benchmark/BenchmarkRunner.js`.

Results will be evaluated under standard test environment constraints:
- Node.js v20.x+
- SQLite in-memory / Local MySQL 8.0 / PostgreSQL 16
- Standard single-core CPU execution baseline
- Results published to `docs/BENCHMARK_REPORT.md`
