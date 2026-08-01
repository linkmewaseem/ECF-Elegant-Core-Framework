export class IStorageDriver {
  put(path, contents, options = {}) { throw new Error("Method not implemented."); }
  get(path) { throw new Error("Method not implemented."); }
  exists(path) { throw new Error("Method not implemented."); }
  delete(path) { throw new Error("Method not implemented."); }
  copy(source, destination) { throw new Error("Method not implemented."); }
  move(source, destination) { throw new Error("Method not implemented."); }
  name() { throw new Error("Method not implemented."); }
}
export default IStorageDriver;
