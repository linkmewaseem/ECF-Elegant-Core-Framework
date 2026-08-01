export class ISpan {
  finish(attributes) { throw new Error("Contract method."); }
  addAttribute(key, value) { throw new Error("Contract method."); }
  addEvent(name, attributes) { throw new Error("Contract method."); }
  setStatus(status) { throw new Error("Contract method."); }
  isFinished() { throw new Error("Contract method."); }
  toObject() { throw new Error("Contract method."); }
}
export default ISpan;
