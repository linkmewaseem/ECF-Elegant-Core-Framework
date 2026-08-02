# ADR-008: Search Platform Architecture & Execution Pipeline

## Status
**Accepted** (Implemented in `@ecf/search`)

## Context
Applications in modern web architectures require fast, reliable full-text search, filtering, faceting, aggregations, highlighting, and automatic model indexing across multiple search backends (Memory, SQL Database, Meilisearch, Typesense, Elasticsearch). Prior to Milestone 25, search relied on raw SQL LIKE queries or ad-hoc filtering.

## Decision
1. **3-Layer Search Architecture**:
   De-couple search into three isolated layers:
   - `SearchEngine`: Top-level orchestrator.
   - `Indexer`: Handles document insertion, deletion, index flushing, and blue-green zero-downtime index alias swaps (`IndexAliasManager`).
   - `QueryEngine`: Coordinates query building, pipeline transformations, ranking boosts, aggregations, and driver invocation.
2. **Dynamic Driver Registry & Capabilities**:
   Dynamic driver registry (`Search.extend(name, factory)`). Each driver exposes `capabilities()` (`facet`, `highlight`, `vector`, `geo`, `aggregate`, `dsl`) so manager can validate or gracefully degrade unsupported features.
3. **Search Middleware Pipeline**:
   Search requests execute through an extensible pipeline: `Normalize` -> `Tokenizer` -> `Synonym` -> `Stemmer` -> `SpellCorrector` -> `QueryExpander` -> `Driver` -> `Ranker` -> `Highlight`.
4. **Scout-style Automatic Model Indexing**:
   Models implementing the `Searchable` trait hook into lifecycle events to dispatch asynchronous `ImportSearchableJob` and `RemoveSearchableJob` tasks into `@ecf/queue`.
5. **Zero-Downtime Blue-Green Re-Indexing**:
   Bulk re-indexing uses `IndexAliasManager` to create a temporary index (`products_v2`), chunk documents through background queue workers, stream live progress (`40% -> 60% -> 100%`) via `@ecf/broadcast`, and atomically swap the index alias (`products -> products_v2`).
6. **Smart Cache Invalidation & DSL**:
   Search results can be cached (`.withCache(300)`). Model mutations automatically invalidate affected query cache tags. Supports both fluent query building and Elastic-style DSL query objects (`Search.dsl({ must: [...] })`).
7. **AI Platform Readiness**:
   Exposes marker contracts (`EmbeddingProvider`, `VectorStore`, `SemanticRanker`, `HybridSearch`, `LLMQueryExpander`) to enable seamless vector and hybrid search integration in Milestone 30 (`@ecf/ai`).

## Consequences

### Positive
- Unified, flexible search interface supporting in-memory, SQL, and external search engines (Meilisearch, Typesense, Elastic).
- Zero downtime during schema migrations and bulk index rebuilds.
- Automatic queue, broadcast, observability, and DevTools integration.

### Negative
- Distributed deployments with external search engines require network connectivity and API keys.
