export class IMailable {
  envelope() { throw new Error("Method not implemented."); }
  content() { throw new Error("Method not implemented."); }
  attachments() { return []; }
}
export default IMailable;
