import test from "node:test";
import assert from "node:assert/strict";
import { SearchManager } from "../../src/index.js";

test("SearchManager: indexes documents and performs full-text search with filtering", async () => {
  const manager = new SearchManager();

  await manager.engine.getIndexer().index("products", [
    { id: 1, title: "iPhone 16 Pro", brand: "apple", price: 1200, category: "phones" },
    { id: 2, title: "Galaxy S24 Ultra", brand: "samsung", price: 1100, category: "phones" },
    { id: 3, title: "MacBook Pro 16", brand: "apple", price: 2500, category: "laptops" },
  ]);

  const result = await manager
    .index("products")
    .query("iphone")
    .where("brand", "apple")
    .get();

  assert.equal(result.hits.length, 1);
  assert.equal(result.hits[0].title, "iPhone 16 Pro");
});

test("SearchManager: supports faceting, aggregations, and highlighting", async () => {
  const manager = new SearchManager();

  await manager.engine.getIndexer().index("items", [
    { id: 10, title: "Awesome Smartphone", price: 500, tag: "tech" },
    { id: 11, title: "Super Smartphone", price: 700, tag: "tech" },
  ]);

  const result = await manager
    .index("items")
    .query("Smartphone")
    .facet("tag")
    .aggregate("price", "avg")
    .highlight(["title"])
    .get();

  assert.equal(result.hits.length, 2);
  assert.equal(result.facets.tag.tech, 2);
  assert.equal(result.aggregations.price_avg, 600);
  assert.equal(result.hits[0]._formatted.title.includes("<mark>"), true);
});
