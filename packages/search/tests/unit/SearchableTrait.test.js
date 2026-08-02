import test from "node:test";
import assert from "node:assert/strict";
import { SearchManager, Searchable } from "../../src/index.js";

test("Searchable: model automatic indexing and unindexing", async () => {
  const manager = new SearchManager();

  class User {
    constructor(id, name) {
      this.id = id;
      this.name = name;
      Object.assign(this, Searchable);
    }
  }

  const user = new User(100, "Alice");
  await user.searchable(manager);

  const res1 = await manager.index("users").query("Alice").get();
  assert.equal(res1.hits.length, 1);

  await user.unsearchable(manager);

  const res2 = await manager.index("users").query("Alice").get();
  assert.equal(res2.hits.length, 0);
});
