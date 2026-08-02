import test from "node:test";
import assert from "node:assert/strict";
import { OpenApiGenerator } from "../../src/index.js";

test("OpenApiGenerator: produces valid OpenAPI 3.0.3 specification", () => {
  const generator = new OpenApiGenerator("Test API", "2.0.0");
  const spec = generator.generate([
    { method: "GET", path: "/api/v1/users", summary: "List users" },
    { method: "POST", path: "/api/v1/users", summary: "Create user" },
  ]);

  assert.equal(spec.openapi, "3.0.3");
  assert.equal(spec.info.title, "Test API");
  assert.equal(Boolean(spec.paths["/api/v1/users"].get), true);
  assert.equal(Boolean(spec.paths["/api/v1/users"].post), true);
});
