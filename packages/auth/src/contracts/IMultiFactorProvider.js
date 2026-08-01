export class IMultiFactorProvider {
  generateSecret(user) { throw new Error("Method not implemented."); }
  verifyCode(user, code, options = {}) { throw new Error("Method not implemented."); }
  name() { throw new Error("Method not implemented."); }
}
export default IMultiFactorProvider;
