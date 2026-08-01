export class IWorker {
  runNextJob(queue) { throw new Error("Method not implemented."); }
  daemon(queue, options) { throw new Error("Method not implemented."); }
  stop() { throw new Error("Method not implemented."); }
}
export default IWorker;
