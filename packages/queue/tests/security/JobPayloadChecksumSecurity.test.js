import test from "node:test";
import assert from "node:assert/strict";
import JobSerializer from "../../src/core/JobSerializer.js";
import Job from "../../src/core/Job.js";
import { InvalidJobPayloadException } from "../../src/exceptions/QueueException.js";

class TestUserJob extends Job {
  tags() { return ["user:42", "billing"]; }
  handle() { return true; }
}

test("JobPayloadChecksumSecurity - generates versioned payload with SHA-256 checksum & HMAC signature", () => {
  const serializer = new JobSerializer("my-secret-key");
  const job = new TestUserJob({ userId: 42 });

  const payload = serializer.serialize(job, { queue: "high" });

  assert.equal(payload.v, 1);
  assert.equal(payload.job, "TestUserJob");
  assert.equal(payload.queue, "high");
  assert.ok(payload.checksum.length === 64);
  assert.ok(payload.signature.length === 64);

  const deserialized = serializer.deserialize(payload);
  assert.equal(deserialized.id, payload.id);
});

test("JobPayloadChecksumSecurity - rejects tampered payload with checksum or signature mismatch", () => {
  const serializer = new JobSerializer("my-secret-key");
  const job = new TestUserJob({ userId: 42 });
  const payload = serializer.serialize(job);

  // Tamper payload data
  const tamperedPayload = { ...payload, data: { userId: 999 } };

  assert.throws(() => {
    serializer.deserialize(tamperedPayload);
  }, InvalidJobPayloadException);
});
