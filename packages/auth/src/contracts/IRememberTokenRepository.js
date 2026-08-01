export class IRememberTokenRepository {
  create(userId, selector, hashedVerifier, expiresAt, metadata = {}) { throw new Error("Method not implemented."); }
  find(selector) { throw new Error("Method not implemented."); }
  updateVerifier(selector, newHashedVerifier, expiresAt) { throw new Error("Method not implemented."); }
  delete(selector) { throw new Error("Method not implemented."); }
  deleteAllForUser(userId) { throw new Error("Method not implemented."); }
}
export default IRememberTokenRepository;
