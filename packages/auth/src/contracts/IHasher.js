export class IHasher {
  make(value, options = {}) { throw new Error("Method not implemented."); }
  check(value, hashedValue, options = {}) { throw new Error("Method not implemented."); }
  needsRehash(hashedValue, options = {}) { throw new Error("Method not implemented."); }
}
export default IHasher;
