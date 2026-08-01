export class IImageProcessor {
  resize(width, height, options) { throw new Error("Contract interface method."); }
  crop(x, y, width, height) { throw new Error("Contract interface method."); }
  fit(mode) { throw new Error("Contract interface method."); }
  rotate(degrees) { throw new Error("Contract interface method."); }
  flip() { throw new Error("Contract interface method."); }
  flop() { throw new Error("Contract interface method."); }
  blur(sigma) { throw new Error("Contract interface method."); }
  grayscale() { throw new Error("Contract interface method."); }
  sepia() { throw new Error("Contract interface method."); }
  sharpen() { throw new Error("Contract interface method."); }
  watermark(source, options) { throw new Error("Contract interface method."); }
  canvas(width, height, background) { throw new Error("Contract interface method."); }
  stripMetadata() { throw new Error("Contract interface method."); }
  toFormat(format, options) { throw new Error("Contract interface method."); }
  getMetadata() { throw new Error("Contract interface method."); }
  toBuffer() { throw new Error("Contract interface method."); }
}
export default IImageProcessor;
