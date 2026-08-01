export class IPasswordBroker {
  sendResetLink(credentials) { throw new Error("Method not implemented."); }
  reset(credentials, callback) { throw new Error("Method not implemented."); }
}
export default IPasswordBroker;
