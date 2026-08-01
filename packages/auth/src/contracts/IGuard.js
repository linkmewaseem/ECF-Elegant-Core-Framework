export class IGuard {
  check() { throw new Error("Method not implemented."); }
  guest() { throw new Error("Method not implemented."); }
  user() { throw new Error("Method not implemented."); }
  id() { throw new Error("Method not implemented."); }
  validate(credentials = {}) { throw new Error("Method not implemented."); }
  setUser(user) { throw new Error("Method not implemented."); }
  hasUser() { throw new Error("Method not implemented."); }
}
export default IGuard;
