import test from "node:test";
import assert from "node:assert/strict";
import PasswordHasher from "../../src/authentication/passwords/PasswordHasher.js";

test("PasswordHasher - makes versioned scrypt hash envelope and verifies correctly", async () => {
  const hasher = new PasswordHasher();
  const password = "SuperSecretPassword123!";
  const hash = await hasher.make(password);

  assert.ok(hash.startsWith("$ecf$scrypt$"), "Hash should start with $ecf$scrypt$");

  const isValid = await hasher.check(password, hash);
  assert.equal(isValid, true, "Valid password check should return true");

  const isInvalid = await hasher.check("WrongPassword", hash);
  assert.equal(isInvalid, false, "Wrong password check should return false");
});

test("PasswordHasher - PBKDF2 algorithm option", async () => {
  const hasher = new PasswordHasher();
  const password = "FIPS_Password_456";
  const hash = await hasher.make(password, { algorithm: "pbkdf2" });

  assert.ok(hash.startsWith("$ecf$pbkdf2$"), "Hash should start with $ecf$pbkdf2$");

  const isValid = await hasher.check(password, hash);
  assert.equal(isValid, true);
});

test("PasswordHasher - needsRehash detection", async () => {
  const hasher = new PasswordHasher({ cost: 16384 });
  const hash = await hasher.make("Pass", { cost: 16384 });

  assert.equal(hasher.needsRehash(hash, { cost: 16384 }), false);
  assert.equal(hasher.needsRehash(hash, { cost: 32768 }), true, "Higher cost should require rehash");
});
