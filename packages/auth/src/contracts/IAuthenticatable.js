export class IAuthenticatable {
  getAuthIdentifierName() { return "id"; }
  getAuthIdentifier() { throw new Error("Method not implemented."); }
  getAuthPasswordName() { return "password"; }
  getAuthPassword() { throw new Error("Method not implemented."); }
  getRememberToken() { throw new Error("Method not implemented."); }
  setRememberToken(value) { throw new Error("Method not implemented."); }
  getRememberTokenName() { return "remember_token"; }
  isLocked() { return false; }
  isSuspended() { return false; }
  isDisabled() { return false; }
}
export default IAuthenticatable;
