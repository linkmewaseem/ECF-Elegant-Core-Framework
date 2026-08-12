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

  #getEvents() {
    if (this.app && typeof this.app.make === "function" && this.app.has("events")) {
      return this.app.make("events");
    }
    const app = globalThis.__ECF_APP__;
    if (app && typeof app.make === "function" && app.has("events")) {
      return app.make("events");
    }
    return null;
  }

  push(jobInstance, data, queue) {
    const res = this.connection().push(jobInstance, data, queue);
    const events = this.#getEvents();
    if (events) {
      try {
        const jobName = typeof jobInstance === "string" ? jobInstance : (jobInstance?.constructor?.name || "Job");
        events.dispatch("JobDispatched", {
          jobName,
          queue: queue || jobInstance?.queue || "default",
          payload: data || jobInstance?.data || {}
        });
      } catch {}
    }
    return res;
  }

  later(delayInSeconds, jobInstance, data, queue) {
    const res = this.connection().later(delayInSeconds, jobInstance, data, queue);
    const events = this.#getEvents();
    if (events) {
      try {
        const jobName = typeof jobInstance === "string" ? jobInstance : (jobInstance?.constructor?.name || "Job");
        events.dispatch("JobDispatched", {
          jobName,
          queue: queue || jobInstance?.queue || "default",
          payload: data || jobInstance?.data || {},
          delaySeconds: delayInSeconds
        });
      } catch {}
    }
    return res;
  }

  fake() {
    this.fakeHarness = new QueueTestingFake();
    return this.fakeHarness;
  }
}

export default QueueManager;
