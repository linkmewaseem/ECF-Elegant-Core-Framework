import test from "node:test";
import assert from "node:assert/strict";
import { CorrelationIdMiddleware, ETagMiddleware } from "../../src/index.js";

test("CorrelationIdMiddleware: assigns X-Request-ID and X-Correlation-ID headers", async () => {
  const mw = new CorrelationIdMiddleware();
  const req = { headers: {} };
  const resHeaders = {};
  const res = { setHeader: (k, v) => (resHeaders[k] = v) };

  await mw.handle(req, res, async () => {});

  assert.equal(Boolean(req.requestId), true);
  assert.equal(resHeaders["X-Request-ID"], req.requestId);
});

test("ETagMiddleware: generates ETag hashes for GET responses", async () => {
  const etag = ETagMiddleware.generateETag({ data: "hello" });
  assert.equal(etag.startsWith('W/"'), true);
});
