import test from "node:test";
import assert from "node:assert/strict";
import { SearchManager } from "../../src/index.js";

test("SearchFake: supports rich search assertions", async () => {
  const manager = new SearchManager();
  const fake = manager.fake();

  await manager.engine.getIndexer().index("products", [{ id: 1, name: "Watch" }]);
  await manager.index("products").query("Watch").get();

  assert.equal(fake.assertIndexed("products", 1), true);
  assert.equal(fake.assertSearched("Watch"), true);

  await manager.engine.getIndexer().remove("products", 1);
  assert.equal(fake.assertRemoved("products", 1), true);

  fake.reset();
  assert.equal(fake.assertNothingSearched(), true);
});
