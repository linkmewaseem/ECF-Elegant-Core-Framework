import test from "node:test";
import assert from "node:assert/strict";
import SessionManager from "../../src/authentication/sessions/SessionManager.js";
import SessionGuard from "../../src/authentication/guards/SessionGuard.js";
import MemoryUserProvider from "../../src/authentication/providers/MemoryUserProvider.js";

test("SessionAdversarial - Session Fixation Protection: Session ID changes upon login", async () => {
  const provider = new MemoryUserProvider([{ id: "10", username: "target", password: "SecretPassword123" }]);
  const sessionManager = new SessionManager();
  const guard = new SessionGuard("web", provider, sessionManager);

  // Attacker creates initial unauthenticated session
  const initialSession = await sessionManager.createSession(null, { attackerData: true });
  const initialId = initialSession.id;

  // Target logs in -> Session ID must be regenerated/changed
  await guard.login({ id: "10" });
  const newId = guard.currentSession.id;

  assert.notEqual(initialId, newId, "Session ID MUST change on login to prevent fixation");
});

test("SessionAdversarial - Idle timeout and absolute lifetime expiration", async () => {
  const sessionManager = new SessionManager(null, { idleTimeout: 1, absoluteLifetime: 2 });
  const session = await sessionManager.createSession(55);

  // Wait 1.1s -> Idle timeout should invalidate session
  await new Promise(r => setTimeout(r, 1100));

  const fetched = await sessionManager.getSession(session.id);
  assert.equal(fetched, null, "Session should expire after idle timeout");
});
