import test from "node:test";
import assert from "node:assert/strict";
import { SearchManager } from "../../src/index.js";

test("Integration: Blue-Green reindexing and suggestions engine", async () => {
  const manager = new SearchManager();

  await manager.engine.getIndexer().blueGreenReindex("products", async (tempIndex) => {
    await manager.engine.getIndexer().index(tempIndex, [
      { id: 1, name: "Tablet" },
      { id: 2, name: "Laptop" },
    ]);
  });

  const res = await manager.index("products").query("Tablet").get();
  assert.equal(res.hits.length, 1);
  assert.equal(res.hits[0].name, "Tablet");

  const suggestions = manager.suggest("tab");
  assert.equal(suggestions.includes("tablet"), true);
});
