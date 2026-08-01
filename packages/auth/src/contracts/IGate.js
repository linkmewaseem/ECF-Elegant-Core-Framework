export class IGate {
  define(ability, callback) { throw new Error("Method not implemented."); }
  policy(model, policy) { throw new Error("Method not implemented."); }
  allows(user, ability, ...arguments_) { throw new Error("Method not implemented."); }
  denies(user, ability, ...arguments_) { throw new Error("Method not implemented."); }
  check(user, ability, ...arguments_) { throw new Error("Method not implemented."); }
  authorize(user, ability, ...arguments_) { throw new Error("Method not implemented."); }
  before(callback) { throw new Error("Method not implemented."); }
  after(callback) { throw new Error("Method not implemented."); }
}
export default IGate;
