export class IStorageManager {
  disk(name = null) { throw new Error("Method not implemented."); }
  extend(driverName, creator) { throw new Error("Method not implemented."); }
  fake(diskName = "local") { throw new Error("Method not implemented."); }
}
export default IStorageManager;
