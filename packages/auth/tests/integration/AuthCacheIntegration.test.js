import test from "node:test";
import assert from "node:assert/strict";
import SessionManager from "../../src/authentication/sessions/SessionManager.js";
import ISessionRepository from "../../src/contracts/ISessionRepository.js";

class CacheSessionRepository extends ISessionRepository {
  constructor() {
    super();
    this.cache = new Map();
  }
  async find(sessionId) {
    return this.cache.get(sessionId) || null;
  }
  async save(sessionId, data, ttl) {
    this.cache.set(sessionId, data);
  }
  async destroy(sessionId) {
    this.cache.delete(sessionId);
  }
  async destroyUserSessions(userId, exceptSessionId = null) {
    for (const [id, session] of this.cache.entries()) {
      if (String(session.userId) === String(userId) && id !== exceptSessionId) {
        this.cache.delete(id);
      }
    }
  }
}

test("AuthCacheIntegration - Cache-backed SessionManager lifecycle and multi-device revocation", async () => {
  const repo = new CacheSessionRepository();
  const manager = new SessionManager(repo, { idleTimeout: 300, absoluteLifetime: 3600 });

  // Create two sessions for user 50
  const session1 = await manager.createSession(50, { device: "mobile" });
  const session2 = await manager.createSession(50, { device: "desktop" });

  assert.ok(await manager.getSession(session1.id));
  assert.ok(await manager.getSession(session2.id));

  // Revoke other sessions except desktop (session2)
  await manager.revokeUserSessions(50, session2.id);

  assert.equal(await manager.getSession(session1.id), null, "Session 1 should be destroyed");
  assert.ok(await manager.getSession(session2.id), "Session 2 should remain active");
});
