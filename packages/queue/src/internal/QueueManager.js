import IQueueManager from "../contracts/IQueueManager.js";
import SyncDriver from "../drivers/SyncDriver.js";
import MemoryDriver from "../drivers/MemoryDriver.js";
import QueueTestingFake from "../testing/QueueTestingFake.js";
import Job from "../core/Job.js";

export class QueueManager extends IQueueManager {
  constructor(app = null) {
    super();
    this.app = app;
    this.connections = new Map();
    this.defaultConnection = "memory";
    this.fakeHarness = null;

    Job.setQueueManager(this);
  }

  connection(name = null) {
    const connName = name || this.defaultConnection;
    if (this.fakeHarness) {
      return this.fakeHarness;
    }
    if (!this.connections.has(connName)) {
      this.connections.set(connName, this.resolve(connName));
    }
    return this.connections.get(connName);
  }

  resolve(name) {
    if (name === "sync") return new SyncDriver();
    if (name === "memory") return new MemoryDriver();
    throw new Error(`Queue connection driver '${name}' is not configured.`);
  }

  push(jobInstance, data, queue) {
    return this.connection().push(jobInstance, data, queue);
  }

  later(delayInSeconds, jobInstance, data, queue) {
    return this.connection().later(delayInSeconds, jobInstance, data, queue);
  }

  fake() {
    this.fakeHarness = new QueueTestingFake();
    return this.fakeHarness;
  }
}

export default QueueManager;
