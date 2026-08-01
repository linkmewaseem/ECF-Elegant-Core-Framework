import test from "node:test";
import assert from "node:assert/strict";
import RememberMeManager from "../../src/authentication/sessions/RememberMeManager.js";
import PasswordBroker from "../../src/authentication/passwords/PasswordBroker.js";
import PasswordHasher from "../../src/authentication/passwords/PasswordHasher.js";
import MemoryUserProvider from "../../src/authentication/providers/MemoryUserProvider.js";
import AuthContext from "../../src/contracts/IAuthContext.js";

class MockRememberTokenRepository {
  constructor() {
    this.tokens = new Map();
  }
  async create(userId, selector, hashedVerifier, expiresAt) {
    this.tokens.set(selector, { user_id: userId, selector, hashed_verifier: hashedVerifier, expires_at: expiresAt });
  }
  async find(selector) {
    return this.tokens.get(selector) || null;
  }
  async updateVerifier(selector, newHashedVerifier, expiresAt) {
    const t = this.tokens.get(selector);
    if (t) {
      t.hashed_verifier = newHashedVerifier;
      t.expires_at = expiresAt;
    }
  }
  async delete(selector) {
    this.tokens.delete(selector);
  }
  async deleteAllForUser(userId) {
    for (const [s, t] of this.tokens.entries()) {
      if (t.user_id === userId) this.tokens.delete(s);
    }
  }
}

class MockPasswordResetTokenRepository {
  constructor() {
    this.resets = new Map();
  }
  async create(email, hashedToken, expiresAt) {
    this.resets.set(email, { email, hashed_token: hashedToken, expires_at: expiresAt });
  }
  async find(email) {
    return this.resets.get(email) || null;
  }
  async delete(email) {
    this.resets.delete(email);
  }
}

test("RememberMe Security - selector/verifier rotation and theft detection", async () => {
  const repo = new MockRememberTokenRepository();
  const manager = new RememberMeManager(repo);
  const provider = new MemoryUserProvider([{ id: "usr_100", email: "user@ecf.dev" }]);

  const rawToken = await manager.createToken("usr_100");
  assert.ok(rawToken.includes("."));

  // 1. Valid token validation and verifier rotation
  const result = await manager.validateAndRotate(rawToken, provider);
  assert.ok(result);
  assert.equal(result.user.id, "usr_100");
  assert.notEqual(result.newToken, rawToken, "Verifier should be rotated on use");

  // 2. Theft / Replay attempt using old rawToken
  const theftAttempt = await manager.validateAndRotate(rawToken, provider);
  assert.equal(theftAttempt, null, "Replay of old token should fail");

  // 3. Confirm all tokens for user were revoked due to theft detection
  const newRotationAttempt = await manager.validateAndRotate(result.newToken, provider);
  assert.equal(newRotationAttempt, null, "All remember tokens should be invalidated after theft detection");
});

test("PasswordBroker Security - enumeration safety & single-use reset token", async () => {
  const resetRepo = new MockPasswordResetTokenRepository();
  const hasher = new PasswordHasher();
  const provider = new MemoryUserProvider([{ id: "1", email: "target@ecf.dev", password: await hasher.make("OldPass123!") }]);
  const broker = new PasswordBroker(provider, resetRepo, hasher);

  // Enumeration safety test
  const existingRes = await broker.sendResetLink({ email: "target@ecf.dev" });
  const nonExistingRes = await broker.sendResetLink({ email: "ghost@ecf.dev" });

  assert.equal(existingRes.message, nonExistingRes.message, "Response message must be enumeration safe");

  // Perform Reset
  const rawToken = existingRes.token;
  const resetRes = await broker.reset({ email: "target@ecf.dev", token: rawToken, password: "NewStrongPass456!" });
  assert.equal(resetRes.status, "PASSWORD_RESET");

  // Attempt replay of reset token
  const replayRes = await broker.reset({ email: "target@ecf.dev", token: rawToken, password: "AnotherPassword" });
  assert.equal(replayRes.status, "INVALID_TOKEN", "Reset token must be single-use");
});

test("AuthContext - AsyncLocalStorage request state isolation", async () => {
  const result1 = await AuthContext.run({ user: { id: 1, name: "Alice" } }, async () => {
    await new Promise(r => setTimeout(r, 10));
    return AuthContext.user().name;
  });

  const result2 = await AuthContext.run({ user: { id: 2, name: "Bob" } }, async () => {
    await new Promise(r => setTimeout(r, 5));
    return AuthContext.user().name;
  });

  assert.equal(result1, "Alice");
  assert.equal(result2, "Bob");
});
