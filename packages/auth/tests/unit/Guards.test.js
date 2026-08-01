import test from "node:test";
import assert from "node:assert/strict";
import MemoryUserProvider from "../../src/authentication/providers/MemoryUserProvider.js";
import SessionManager from "../../src/authentication/sessions/SessionManager.js";
import SessionGuard from "../../src/authentication/guards/SessionGuard.js";
import ApiKeyGuard from "../../src/authentication/guards/ApiKeyGuard.js";
import SignedUrlGuard from "../../src/authentication/guards/SignedUrlGuard.js";
import ApiKeyService from "../../src/authentication/tokens/ApiKeyService.js";

test("SessionGuard - login, authenticate from session, and logout", async () => {
  const provider = new MemoryUserProvider([{ id: "1", username: "alex", password: "secretPassword" }]);
  const sessionManager = new SessionManager();
  const guard = new SessionGuard("session", provider, sessionManager);

  assert.equal(guard.check(), false);

  const attemptResult = await guard.attempt({ username: "alex", password: "secretPassword" });
  assert.equal(attemptResult, true);
  assert.equal(guard.check(), true);
  assert.equal(guard.id(), "1");

  const sessionId = guard.currentSession.id;
  
  // Create clean guard to simulate new request
  const newGuard = new SessionGuard("session", provider, sessionManager);
  await newGuard.authenticateFromSession(sessionId);
  assert.equal(newGuard.check(), true);
  assert.equal(newGuard.id(), "1");

  await newGuard.logout();
  assert.equal(newGuard.check(), false);
});

test("ApiKeyGuard - authenticates prefixed API key", async () => {
  const apiKeyService = new ApiKeyService({ prefix: "ecf_live_" });
  const keyObj = apiKeyService.generateKey();

  const provider = new MemoryUserProvider([{ id: "99", name: "ServiceAccount", remember_token: keyObj.hash }]);
  const guard = new ApiKeyGuard("api", provider, apiKeyService);

  const user = await guard.authenticateKey(keyObj.key);
  assert.ok(user);
  assert.equal(user.id, "99");
});

test("SignedUrlGuard - creates and verifies signed URLs", () => {
  const signer = new SignedUrlGuard("test-secret-key");
  const signedUrl = signer.sign("http://localhost/verify-email?user=42", 300);

  assert.equal(signer.hasValidSignature(signedUrl), true);
  assert.equal(signer.hasValidSignature("http://localhost/verify-email?user=42&signature=fake"), false);
});
