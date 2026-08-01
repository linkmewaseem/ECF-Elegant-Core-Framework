import test from "node:test";
import assert from "node:assert/strict";
import MemoryTransport from "../../src/transports/MemoryTransport.js";
import FailoverTransport, { LoadBalancedTransport } from "../../src/transports/FailoverTransport.js";
import MailMessage from "../../src/internal/MailMessage.js";

test("MemoryTransport - captures sent mail messages", async () => {
  const transport = new MemoryTransport();
  const msg = new MailMessage({ envelope: { to: "dev@example.com", subject: "Test" } });

  const res = await transport.send(msg);
  assert.equal(res.success, true);
  assert.equal(transport.messages.length, 1);
});

test("FailoverTransport & LoadBalancedTransport - fallback and distribution", async () => {
  const primary = new MemoryTransport();
  const secondary = new MemoryTransport();

  const failover = new FailoverTransport([primary, secondary]);
  const loadBalancer = new LoadBalancedTransport([primary, secondary]);

  const msg = new MailMessage({ envelope: { to: "test@example.com" } });

  await failover.send(msg);
  assert.equal(primary.messages.length, 1);

  await loadBalancer.send(msg); // sent to primary
  await loadBalancer.send(msg); // sent to secondary

  assert.equal(primary.messages.length, 2);
  assert.equal(secondary.messages.length, 1);
});
