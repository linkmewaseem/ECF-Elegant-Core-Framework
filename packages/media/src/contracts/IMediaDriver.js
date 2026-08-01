export class IMediaDriver {
  canHandle(type) { throw new Error("Contract interface method."); }
  process(mediaFile, transformations) { throw new Error("Contract interface method."); }
  name() { throw new Error("Contract interface method."); }
}
export default IMediaDriver;
