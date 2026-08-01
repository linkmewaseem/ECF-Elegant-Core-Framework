export class IFilesystem {
  put(path, contents, options = {}) { throw new Error("Method not implemented."); }
  get(path) { throw new Error("Method not implemented."); }
  exists(path) { throw new Error("Method not implemented."); }
  delete(path) { throw new Error("Method not implemented."); }
  copy(source, destination) { throw new Error("Method not implemented."); }
  move(source, destination) { throw new Error("Method not implemented."); }
  readStream(path) { throw new Error("Method not implemented."); }
  writeStream(path, stream, options = {}) { throw new Error("Method not implemented."); }
  metadata(path) { throw new Error("Method not implemented."); }
  temporaryUrl(path, expiration, options = {}) { throw new Error("Method not implemented."); }
  url(path) { throw new Error("Method not implemented."); }
}
export default IFilesystem;
