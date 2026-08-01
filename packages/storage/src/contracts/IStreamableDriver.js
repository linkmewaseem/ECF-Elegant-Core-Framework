export class IStreamableDriver {
  readStream(path) { throw new Error("Method not implemented."); }
  writeStream(path, stream, options = {}) { throw new Error("Method not implemented."); }
}
export default IStreamableDriver;
