export class ISessionRepository {
  find(sessionId) { throw new Error("Method not implemented."); }
  save(sessionId, data, ttl) { throw new Error("Method not implemented."); }
  destroy(sessionId) { throw new Error("Method not implemented."); }
  destroyUserSessions(userId, exceptSessionId = null) { throw new Error("Method not implemented."); }
}
export default ISessionRepository;
