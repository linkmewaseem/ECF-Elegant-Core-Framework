import test from "node:test";
import assert from "node:assert/strict";
import Gate from "../../src/authorization/Gate.js";
import PolicyManager from "../../src/authorization/PolicyManager.js";
import PermissionResolver from "../../src/authorization/PermissionResolver.js";

class Post {
  constructor(id, userId) {
    this.id = id;
    this.userId = userId;
  }
}

class PostPolicy {
  before(user) {
    if (user && user.role === "admin") return true;
    return null;
  }
  update(user, post) {
    return user.id === post.userId;
  }
}

test("Gate & Policy - ability definition and policy evaluation", async () => {
  const policyManager = new PolicyManager();
  const gate = new Gate(null, policyManager);

  gate.define("edit-settings", (user) => user.role === "admin");
  gate.policy(Post, PostPolicy);

  const admin = { id: 1, role: "admin" };
  const user1 = { id: 10, role: "user" };
  const user2 = { id: 20, role: "user" };
  const post = new Post(101, 10);

  assert.equal(await gate.allows(admin, "edit-settings"), true);
  assert.equal(await gate.allows(user1, "edit-settings"), false);

  assert.equal(await gate.allows(admin, "update", post), true, "Admin should bypass via policy before hook");
  assert.equal(await gate.allows(user1, "update", post), true, "Owner should be allowed to update post");
  assert.equal(await gate.allows(user2, "update", post), false, "Non-owner should be denied");
});

test("PermissionResolver - role and permission checking", async () => {
  const resolver = new PermissionResolver();
  const user = { permissions: ["posts.create", "posts.edit"], roles: ["editor"] };

  assert.equal(await resolver.hasPermission(user, "posts.create"), true);
  assert.equal(await resolver.hasPermission(user, "posts.delete"), false);
  assert.equal(await resolver.hasRole(user, "editor"), true);
});
