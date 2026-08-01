export class IDeduplicationEngine {
  findExisting(hash) { throw new Error("Method not implemented."); }
  register(hash, manifest) { throw new Error("Method not implemented."); }
}
export default IDeduplicationEngine;
