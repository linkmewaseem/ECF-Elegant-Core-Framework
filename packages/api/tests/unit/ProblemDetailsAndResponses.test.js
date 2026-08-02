import test from "node:test";
import assert from "node:assert/strict";
import { ApiResponseBuilder, ProblemDetailsResponse } from "../../src/index.js";

test("ProblemDetailsResponse: formats RFC-9457 compliant error JSON", () => {
  const problem = ProblemDetailsResponse.validation({ email: ["Email is invalid"] }).toProblemDetails();

  assert.equal(problem.status, 422);
  assert.equal(problem.title, "Unprocessable Entity");
  assert.equal(problem.invalid_params.email[0], "Email is invalid");
});

test("ApiResponseBuilder: builds standard HTTP status objects", () => {
  const okRes = ApiResponseBuilder.ok({ message: "Success" });
  assert.equal(okRes.status, 200);
  assert.equal(okRes.body.message, "Success");

  const valRes = ApiResponseBuilder.validation({ name: ["Required"] });
  assert.equal(valRes.status, 422);
  assert.equal(valRes.body.invalid_params.name[0], "Required");
});
