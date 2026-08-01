import test from "node:test";
import assert from "node:assert/strict";
import PasswordBroker from "../../src/authentication/passwords/PasswordBroker.js";
import PasswordHasher from "../../src/authentication/passwords/PasswordHasher.js";
import MemoryUserProvider from "../../src/authentication/providers/MemoryUserProvider.js";
import IPasswordResetTokenRepository from "../../src/contracts/IPasswordResetTokenRepository.js";

class MockResetRepo extends IPasswordResetTokenRepository {
  constructor() {
    super();
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

test("PasswordResetAdversarial - Expired tokens are rejected and purged", async () => {
  const repo = new MockResetRepo();
  const hasher = new PasswordHasher();
  const provider = new MemoryUserProvider([{ id: "1", email: "alice@ecf.dev", password: "Pass" }]);
  const broker = new PasswordBroker(provider, repo, hasher, null, { ttl: -10 }); // Already expired

  const linkRes = await broker.sendResetLink({ email: "alice@ecf.dev" });
  assert.ok(linkRes.token);

  const resetRes = await broker.reset({ email: "alice@ecf.dev", token: linkRes.token, password: "NewPass123!" });
  assert.equal(resetRes.status, "EXPIRED_TOKEN");
  assert.equal(await repo.find("alice@ecf.dev"), null, "Expired token must be purged");
});
