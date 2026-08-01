import IQueueDriver from "../contracts/IQueueDriver.js";

export class SyncDriver extends IQueueDriver {
  name() {
    return "sync";
  }

  async push(jobInstance) {
    if (typeof jobInstance.handle === "function") {
      return jobInstance.handle();
    }
    return true;
  }

  async later(delayInSeconds, jobInstance) {
    return this.push(jobInstance);
  }

  async pop() {
    return null;
  }

  async size() {
    return 0;
  }

  async clear() {
    return true;
  }
}

export default SyncDriver;
