import IJob from "../contracts/IJob.js";

export class Job extends IJob {
  constructor(data = {}) {
    super();
    this.data = data;
    this.queue = "default";
    this.connection = null;
    this.delaySeconds = 0;
    this.tries = 3;
    this.timeout = 60;
    this.cancelled = false;
    this._queueManager = null;
  }

  onQueue(queue) {
    this.queue = queue;
    return this;
  }

  onConnection(connection) {
    this.connection = connection;
    return this;
  }

  delay(seconds) {
    this.delaySeconds = seconds;
    return this;
  }

  setTries(count) {
    this.tries = count;
    return this;
  }

  cancel() {
    this.cancelled = true;
    return this;
  }

  tags() {
    return [this.constructor.name];
  }

  middleware() {
    return [];
  }

  static setQueueManager(manager) {
    this._queueManager = manager;
  }

  static async dispatch(...args) {
    const jobInstance = new this(...args);
    if (this._queueManager) {
      return this._queueManager.push(jobInstance);
    }
    return jobInstance;
  }

  static async dispatchSync(...args) {
    const jobInstance = new this(...args);
    return jobInstance.handle();
  }
}

export default Job;
