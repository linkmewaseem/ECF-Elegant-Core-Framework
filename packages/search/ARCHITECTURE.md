# `@ecf/search` Architecture & Design Specification

## Overview
`@ecf/search` provides an enterprise search platform for ECF applications.

```text
Search Query / Model Save
            │
            ▼
      SearchManager
            │
      SearchEngine
      ┌─────┴─────┐
   Indexer    QueryEngine
      │           │
      ▼           ▼
DriverRegistry ──► Search Pipeline (Normalize -> Tokenizer -> Synonym -> Ranker -> Highlight)
      │
      ▼
[ Memory | Database | Meilisearch | Typesense | Elastic | Custom ]
```

## Performance Benchmarking Targets

| Operation | Target Throughput / Latency |
| :--- | :--- |
| **Memory Search** | > 50,000 queries/sec |
| **Memory Indexing** | > 100,000 docs/sec |
| **Search Pipeline Latency** | < 1.5ms overhead |
| **Blue-Green Alias Swap** | < 1ms atomic switch |

## 3-Layer Architecture Components
1. **`SearchEngine`**: High-level coordinator between indexing and querying.
2. **`Indexer`**: Document indexing, removal, blue-green alias management (`IndexAliasManager`), and chunked bulk workers.
3. **`QueryEngine`**: Pipeline execution, ranking boosts, aggregations, faceting, highlighting, and driver invocation.
4. **`DriverCapabilities`**: Capability matrix inspection (`facet`, `highlight`, `vector`, `geo`, `aggregate`, `dsl`).
5. **AI Preparation**: Marker contracts for Milestone 30 (`@ecf/ai`).
