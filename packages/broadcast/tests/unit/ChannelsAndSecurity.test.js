import test from "node:test";
import assert from "node:assert/strict";
import { BroadcastManager, CompiledPattern, BroadcasterAuthorizer, MemoryPresenceRepository } from "../../src/index.js";

test("CompiledPattern: compiles pattern and matches parameters", () => {
  const pattern = new CompiledPattern("orders.{id}.items.{itemId}");
  const match = pattern.match("orders.101.items.55");

  assert.notEqual(match, null);
  assert.equal(match.id, "101");
  assert.equal(match.itemId, "55");

  assert.equal(pattern.match("orders.101"), null);
});

test("BroadcasterAuthorizer: authorizes private and presence channels", async () => {
  const authorizer = new BroadcasterAuthorizer();
  authorizer.channel("chat.{room}", (user, room) => {
    return user.id === 1 && room === "general";
  });

  const valid = await authorizer.authorize("private-chat.general", { id: 1 });
  assert.equal(valid.authorized, true);

  const invalid = await authorizer.authorize("private-chat.secret", { id: 1 });
  assert.equal(invalid.authorized, false);
});

test("MemoryPresenceRepository: join, leave, members, count, exists", async () => {
  const repo = new MemoryPresenceRepository();

  await repo.join("room.1", { id: "u1", name: "Alice" });
  await repo.join("room.1", { id: "u2", name: "Bob" });

  assert.equal(await repo.count("room.1"), 2);
  assert.equal(await repo.exists("room.1", "u1"), true);

  await repo.leave("room.1", "u1");
  assert.equal(await repo.count("room.1"), 1);
  assert.equal(await repo.exists("room.1", "u1"), false);
});
