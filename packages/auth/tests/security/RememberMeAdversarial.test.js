import test from "node:test";
import assert from "node:assert/strict";
import RememberMeManager from "../../src/authentication/sessions/RememberMeManager.js";
import MemoryUserProvider from "../../src/authentication/providers/MemoryUserProvider.js";
import IRememberTokenRepository from "../../src/contracts/IRememberTokenRepository.js";

class MockRememberTokenRepository extends IRememberTokenRepository {
  constructor() {
    super();
    this.store = new Map();
  }
  async create(userId, selector, hashedVerifier, expiresAt) {
    this.store.set(selector, { user_id: userId, selector, hashed_verifier: hashedVerifier, expires_at: expiresAt });
  }
  async find(selector) {
    return this.store.get(selector) || null;
  }
  async updateVerifier(selector, newHashedVerifier, expiresAt) {
    const t = this.store.get(selector);
    if (t) {
      t.hashed_verifier = newHashedVerifier;
      t.expires_at = expiresAt;
    }
  }
  async delete(selector) {
    this.store.delete(selector);
  }
  async deleteAllForUser(userId) {
    for (const [s, t] of this.store.entries()) {
      if (t.user_id === userId) this.store.delete(s);
    }
  }
}

test("RememberMeAdversarial - Invalid verifier replay triggers instant user token revocation", async () => {
  const repo = new MockRememberTokenRepository();
  const manager = new RememberMeManager(repo);
  const provider = new MemoryUserProvider([{ id: "u123", email: "user@ecf.dev" }]);

  // Create two remember tokens for user u123 (e.g. laptop and phone)
  const token1 = await manager.createToken("u123");
  const token2 = await manager.createToken("u123");

  // Validate token1 once -> Rotates verifier
  const res1 = await manager.validateAndRotate(token1, provider);
  assert.ok(res1);

  // Attempt replaying original token1 -> Theft detection triggers!
  const theftRes = await manager.validateAndRotate(token1, provider);
  assert.equal(theftRes, null);

  // Confirm token2 (phone) was ALSO revoked as a security measure
  const res2 = await manager.validateAndRotate(token2, provider);
  assert.equal(res2, null, "All user tokens must be revoked on theft detection");
});
