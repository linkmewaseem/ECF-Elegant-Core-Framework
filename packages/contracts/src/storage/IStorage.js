export class IStorageManager {
  disk(name = null) { throw new Error("Contract interface method."); }
  get(path) { throw new Error("Contract interface method."); }
  put(path, contents) { throw new Error("Contract interface method."); }
}
