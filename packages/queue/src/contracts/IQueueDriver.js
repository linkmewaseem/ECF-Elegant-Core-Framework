export class IQueueDriver {
  push(job, data, queue) { throw new Error("Method not implemented."); }
  later(delayInSeconds, job, data, queue) { throw new Error("Method not implemented."); }
  pop(queue) { throw new Error("Method not implemented."); }
  size(queue) { throw new Error("Method not implemented."); }
  clear(queue) { throw new Error("Method not implemented."); }
  name() { throw new Error("Method not implemented."); }
}
export default IQueueDriver;
