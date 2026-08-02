import test from "node:test";
import assert from "node:assert/strict";
import { ApiVersionManager } from "../../src/index.js";

test("ApiVersionManager: resolves versions from URI, Accept header, X-Api-Version header, or query", () => {
  const manager = new ApiVersionManager("v1", ["v1", "v2"]);

  assert.equal(manager.resolveVersion({ url: "/api/v2/users" }), "v2");
  assert.equal(manager.resolveVersion({ headers: { "x-api-version": "v2" } }), "v2");
  assert.equal(manager.resolveVersion({ headers: { accept: "application/vnd.ecf.v2+json" } }), "v2");
  assert.equal(manager.resolveVersion({ query: { v: "2" } }), "v2");
  assert.equal(manager.resolveVersion({ url: "/api/users" }), "v1");
});
