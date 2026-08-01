import IQueueDriver from "../contracts/IQueueDriver.js";
import JobSerializer from "../core/JobSerializer.js";

const PRIORITY_ORDER = ["critical", "high", "default", "low", "background"];

export class MemoryDriver extends IQueueDriver {
  constructor(serializer = new JobSerializer()) {
    super();
    this.serializer = serializer;
    this.queues = new Map(); // queueName -> payload[]
    for (const p of PRIORITY_ORDER) {
      this.queues.set(p, []);
    }
  }

  name() {
    return "memory";
  }

  getQueueArray(queueName = "default") {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }
    return this.queues.get(queueName);
  }

  async push(jobInstance, options = {}) {
    const queueName = options.queue || jobInstance.queue || "default";
    const payload = this.serializer.serialize(jobInstance, { ...options, queue: queueName });
    payload.availableAt = Date.now();
    payload.jobInstance = jobInstance; // Keep ref for fast memory dispatch

    this.getQueueArray(queueName).push(payload);
    return payload.id;
  }

  async later(delayInSeconds, jobInstance, options = {}) {
    const queueName = options.queue || jobInstance.queue || "default";
    const payload = this.serializer.serialize(jobInstance, { ...options, queue: queueName, delay: delayInSeconds });
    payload.availableAt = Date.now() + delayInSeconds * 1000;
    payload.jobInstance = jobInstance;

    this.getQueueArray(queueName).push(payload);
    return payload.id;
  }

  async pop(queueNames = ["critical", "high", "default", "low", "background"]) {
    const targets = Array.isArray(queueNames) ? queueNames : [queueNames];
    const now = Date.now();

    for (const qName of targets) {
      const queueArr = this.getQueueArray(qName);
      for (let i = 0; i < queueArr.length; i++) {
        const payload = queueArr[i];
        if (payload.availableAt <= now) {
          queueArr.splice(i, 1);
          return payload;
        }
      }
    }
    return null;
  }

  async size(queueName = "default") {
    return this.getQueueArray(queueName).length;
  }

  async clear(queueName = null) {
    if (queueName) {
      this.queues.set(queueName, []);
    } else {
      for (const key of this.queues.keys()) {
        this.queues.set(key, []);
      }
    }
    return true;
  }
}

export default MemoryDriver;
