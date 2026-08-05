# ADR-002: Trie-Based High-Performance HTTP Engine & Middleware Pipeline

## Status
**Accepted** (Implemented in `@ecfjs/http`)

## Context
Standard Node.js HTTP routing often relies on linear regex matching (Express-style), which scales poorly ($O(N)$) as application route counts grow into hundreds of endpoints. We needed a high-throughput (>300,000 req/sec) routing engine with composable middleware.

## Decision
1. Implement a Radix / Trie-based route matching engine (`TrieRouter`) inside `@ecfjs/http` for $O(K)$ path resolution where $K$ is path length.
2. Abstract request/response handling into `NativeRequest` and `NativeResponse` while providing adapter compatibility for Express/Fastify raw objects.
3. Use a pipeline architecture (`Pipeline`) for global and route-specific middleware execution with terminating lifecycle hooks.

## Consequences

### Positive
- Route matching performance remains constant regardless of total route count.
- Request and response lifecycle is completely isolated per request (zero cross-request state leakage).
- Flexible middleware short-circuiting and post-response termination hooks.

### Negative
- Trie router requires strict route static-prefix compilation and regex parameter constraints.
