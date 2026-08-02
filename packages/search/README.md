# `@ecf/search`

Enterprise Search Platform for ECF (Enterprise Core Framework).

## Features

- **3-Layer Search Architecture**: `SearchManager` -> `SearchEngine` -> `Indexer` & `QueryEngine` -> Drivers.
- **Multi-Driver Engine**: Memory, Null, Database (SQL), Meilisearch, Typesense, Elasticsearch.
- **Dynamic Plugin Registry**: Register custom drivers via `Search.extend()`.
- **Search Middleware Pipeline**: Extensible query processing stages (`Normalize`, `Tokenizer`, `Synonym`, `Stemmer`, `SpellCorrector`, `QueryExpander`, `Ranker`, `Highlight`).
- **Ranking Engine**: Field weight boosting (`.boost("title", 10)`).
- **Aggregations & Faceting**: Field aggregations (`avg`, `max`, `min`, `sum`, `count`) and facets.
- **Index Aliases & Blue-Green Indexing**: Zero downtime index alias swapping (`products_v1`, `products_v2` -> `products`).
- **Scout-style Automatic Model Indexing**: `Searchable` trait for automatic model syncing via `@ecf/queue`.
- **Suggestions Engine**: Autocomplete, trending, and popular searches (`Search.suggest()`).
- **Search DSL**: Elastic-style query objects (`Search.dsl({...})`).
- **Driver Capability Matrix**: `driver.capabilities()`.
- **Real-Time Broadcast Progress**: Live progress events (`40% -> 60% -> 100%`) via `@ecf/broadcast`.
- **DevTools Panel**: Horizon-style telemetry.
- **Testing Fake**: Rich assertions with `Search.fake()`.

## Usage

```javascript
import { Search, Searchable } from "@ecf/search";

// Querying
const results = await Search.index("products")
  .query("iphone")
  .where("brand", "apple")
  .boost("title", 5)
  .facet(["category"])
  .aggregate("price", "avg")
  .withCache(300)
  .get();

// Model Integration
class Product extends Model {
  use(Searchable);

  searchableAs() {
    return "products";
  }
}

const product = new Product({ title: "iPhone 16 Pro" });
await product.save(); // Automatically indexed via Queue!
```
