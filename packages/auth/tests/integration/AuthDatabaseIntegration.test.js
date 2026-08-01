import test from "node:test";
import assert from "node:assert/strict";
import OrmUserProvider from "../../src/authentication/providers/OrmUserProvider.js";
import PasswordHasher from "../../src/authentication/passwords/PasswordHasher.js";

class MockUserModel {
  static db = new Map();

  static find(id) {
    return this.db.get(String(id)) || null;
  }

  static where(field, value) {
    for (const u of this.db.values()) {
      if (u[field] === value) {
        return { first: () => u };
      }
    }
    return { first: () => null };
  }

  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  getAuthIdentifier() {
    return this.id;
  }

  getAuthPassword() {
    return this.password;
  }

  getRememberToken() {
    return this.remember_token || null;
  }

  setRememberToken(token) {
    this.remember_token = token;
  }

  async save() {
    MockUserModel.db.set(String(this.id), this);
  }
}

test("AuthDatabaseIntegration - OrmUserProvider retrieves users and validates credentials", async () => {
  const hasher = new PasswordHasher();
  const hashedPassword = await hasher.make("SecretDbPass123");

  const userInstance = new MockUserModel({ id: "usr_10", email: "dbuser@ecf.dev", password: hashedPassword });
  await userInstance.save();

  const provider = new OrmUserProvider(MockUserModel, hasher);

  // Retrieve by ID
  const foundUser = await provider.retrieveById("usr_10");
  assert.ok(foundUser);
  assert.equal(foundUser.email, "dbuser@ecf.dev");

  // Credentials lookup & validation
  const byCreds = await provider.retrieveByCredentials({ email: "dbuser@ecf.dev" });
  assert.ok(byCreds);

  const isValid = await provider.validateCredentials(byCreds, { password: "SecretDbPass123" });
  assert.equal(isValid, true);

  const isInvalid = await provider.validateCredentials(byCreds, { password: "WrongPassword" });
  assert.equal(isInvalid, false);

  // Remember token update
  await provider.updateRememberToken(foundUser, "new_remember_token_abc");
  assert.equal(foundUser.remember_token, "new_remember_token_abc");
});
