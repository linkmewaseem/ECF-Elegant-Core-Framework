import test from "node:test";
import assert from "node:assert/strict";
import { ApiManager } from "../../src/index.js";

test("ApiFake: records calls and executes assertions", () => {
  const manager = new ApiManager();
  const fake = manager.fake();

  fake.recordCall("/api/v1/users", "GET", 200, { data: [] }, {}, { apiVersion: "v1" });
  fake.recordCall("/api/v1/orders", "POST", 429, { type: "error", title: "Limit" }, {}, { apiVersion: "v1" });

  assert.equal(fake.assertCalled("/api/v1/users"), true);
  assert.equal(fake.assertStatus(200), true);
  assert.equal(fake.assertRateLimited(), true);
  assert.equal(fake.assertVersion("v1"), true);

  fake.reset();
});
