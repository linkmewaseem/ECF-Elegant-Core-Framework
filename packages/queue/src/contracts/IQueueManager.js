export class IQueueManager {
  connection(name = null) { throw new Error("Method not implemented."); }
  push(job, data, queue) { throw new Error("Method not implemented."); }
  later(delayInSeconds, job, data, queue) { throw new Error("Method not implemented."); }
  fake() { throw new Error("Method not implemented."); }
}
export default IQueueManager;
