import test from "node:test";
import assert from "node:assert/strict";
import {
  SearchManager,
  NullDriver,
  DatabaseDriver,
  MeilisearchDriver,
  TypesenseDriver,
  ElasticDriver,
} from "../../src/index.js";

test("DriverRegistry & Capabilities: checks capability matrix across drivers", async () => {
  const manager = new SearchManager();

  const memoryCaps = manager.capabilities("memory");
  assert.equal(memoryCaps.supports("facet"), true);
  assert.equal(memoryCaps.supports("vector"), false);

  const elasticCaps = manager.capabilities("elastic");
  assert.equal(elasticCaps.supports("vector"), true);
  assert.equal(elasticCaps.supports("dsl"), true);
});

test("Drivers: validates NullDriver, DatabaseDriver, MeilisearchDriver, TypesenseDriver, ElasticDriver", async () => {
  const nullDriver = new NullDriver();
  assert.equal((await nullDriver.index("idx", [])).success, true);

  const dbDriver = new DatabaseDriver();
  assert.equal((await dbDriver.index("idx", [{ id: 1 }])).success, true);

  const meiliDriver = new MeilisearchDriver();
  assert.equal((await meiliDriver.index("idx", [{ id: 1 }])).success, true);

  const typeDriver = new TypesenseDriver();
  assert.equal((await typeDriver.index("idx", [{ id: 1 }])).success, true);

  const elasticDriver = new ElasticDriver();
  assert.equal((await elasticDriver.index("idx", [{ id: 1 }])).success, true);
});
