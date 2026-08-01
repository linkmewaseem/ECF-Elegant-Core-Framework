export class IPasswordResetTokenRepository {
  create(email, hashedToken, expiresAt) { throw new Error("Method not implemented."); }
  find(email) { throw new Error("Method not implemented."); }
  delete(email) { throw new Error("Method not implemented."); }
  exists(email, hashedToken) { throw new Error("Method not implemented."); }
}
export default IPasswordResetTokenRepository;
