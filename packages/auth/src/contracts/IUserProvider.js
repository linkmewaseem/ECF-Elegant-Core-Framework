export class IUserProvider {
  retrieveById(identifier) { throw new Error("Method not implemented."); }
  retrieveByToken(identifier, token) { throw new Error("Method not implemented."); }
  updateRememberToken(user, token) { throw new Error("Method not implemented."); }
  retrieveByCredentials(credentials) { throw new Error("Method not implemented."); }
  validateCredentials(user, credentials) { throw new Error("Method not implemented."); }
}
export default IUserProvider;
