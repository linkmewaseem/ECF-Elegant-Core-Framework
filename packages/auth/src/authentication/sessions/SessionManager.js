import crypto from "node:crypto";

export class SessionManager {
  constructor(repository = null, options = {}) {
    this.repository = repository || new MapSessionRepository();
    this.idleTimeout = options.idleTimeout || 30 * 60; // 30 mins
    this.absoluteLifetime = options.absoluteLifetime || 12 * 60 * 60; // 12 hours
  }

  async getSession(sessionId) {
    if (!sessionId) return null;
    const session = await this.repository.find(sessionId);
    if (!session) return null;

    const now = Date.now();
    if (session.lastActivity && now - session.lastActivity > this.idleTimeout * 1000) {
      await this.destroy(sessionId);
      return null;
    }
    if (session.createdAt && now - session.createdAt > this.absoluteLifetime * 1000) {
      await this.destroy(sessionId);
      return null;
    }

    session.lastActivity = now;
    await this.repository.save(sessionId, session, this.idleTimeout);
    return session;
  }

  async createSession(userId, data = {}) {
    const sessionId = crypto.randomBytes(24).toString("hex");
    const now = Date.now();
    const session = {
      id: sessionId,
      userId: String(userId),
      createdAt: now,
      lastActivity: now,
      ...data
    };
    await this.repository.save(sessionId, session, this.idleTimeout);
    return session;
  }

  async regenerateId(sessionId) {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    await this.repository.destroy(sessionId);
    const newSessionId = crypto.randomBytes(24).toString("hex");
    session.id = newSessionId;
    session.lastActivity = Date.now();
    await this.repository.save(newSessionId, session, this.idleTimeout);
    return session;
  }

  async destroy(sessionId) {
    if (sessionId) {
      await this.repository.destroy(sessionId);
    }
  }

  async revokeUserSessions(userId, exceptSessionId = null) {
    if (typeof this.repository.destroyUserSessions === "function") {
      await this.repository.destroyUserSessions(userId, exceptSessionId);
    }
  }
}

export class MapSessionRepository {
  constructor() {
    this.sessions = new Map();
  }
  async find(sessionId) {
    return this.sessions.get(sessionId) || null;
  }
  async save(sessionId, data) {
    this.sessions.set(sessionId, data);
  }
  async destroy(sessionId) {
    this.sessions.delete(sessionId);
  }
  async destroyUserSessions(userId, exceptSessionId = null) {
    for (const [sid, s] of this.sessions.entries()) {
      if (String(s.userId) === String(userId) && sid !== exceptSessionId) {
        this.sessions.delete(sid);
      }
    }
  }
}

export default SessionManager;
