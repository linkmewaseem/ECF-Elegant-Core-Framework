import test from "node:test";
import assert from "node:assert/strict";
import GateBridge from "../../../http/src/auth/Gate.js";
import PolicyBridge from "../../../http/src/auth/Policy.js";

class UserPolicy extends PolicyBridge {
  async view(user, targetUser) {
    return user.id === targetUser.id || user.isAdmin;
  }
}

test("HttpAuthBridgeCompatibility - @ecf/http Gate and Policy delegation to @ecf/auth", async () => {
  const gate = new GateBridge();
  gate.define("access-admin", (user) => user.isAdmin);
  gate.policy(Object, new UserPolicy());

  const admin = { id: 1, isAdmin: true };
  const user1 = { id: 10, isAdmin: false };
  const user2 = { id: 20, isAdmin: false };

  // 1. Direct ability definition check
  assert.equal(await gate.allows("access-admin", admin), true);
  assert.equal(await gate.allows("access-admin", user1), false);
  assert.equal(await gate.denies("access-admin", user1), true);

  // 2. Policy class method check
  assert.equal(await gate.allows("view", admin, user2), true);
  assert.equal(await gate.allows("view", user1, user1), true);
  assert.equal(await gate.allows("view", user1, user2), false);
});
