import test from "node:test";
import assert from "node:assert/strict";
import {
  BroadcastManager,
  RateLimitMiddleware,
  CompressPayloadMiddleware,
  AuditMiddleware,
  EncryptPayloadMiddleware,
} from "../../src/index.js";

test("BroadcastPipeline: executes audit, compression and encryption middleware", async () => {
  const manager = new BroadcastManager({ secret: "test-secret" });
  const auditLog = [];

  manager.middleware([
    new AuditMiddleware(auditLog),
    new CompressPayloadMiddleware(),
    new EncryptPayloadMiddleware("test-secret"),
  ]);

  const res = await manager.to("private-orders.1").emit("OrderUpdated", { amount: 500 });

  assert.equal(res.success, true);
  assert.equal(auditLog.length, 1);
  assert.equal(auditLog[0].event, "OrderUpdated");
});
