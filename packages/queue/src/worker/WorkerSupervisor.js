import IWorkerSupervisor from "../contracts/IWorkerSupervisor.js";
import Worker from "./Worker.js";

export class WorkerSupervisor extends IWorkerSupervisor {
  constructor(queueDriver, options = {}) {
    super();
    this.driver = queueDriver;
    this.numWorkers = options.numWorkers || 2;
    this.memoryThresholdMb = options.memoryThresholdMb || 512;
    this.workers = [];
    this.running = false;
  }

  async start(queues = ["default"]) {
    this.running = true;
    for (let i = 0; i < this.numWorkers; i++) {
      const worker = new Worker(this.driver);
      this.workers.push(worker);
      worker.daemon(queues, 50).catch(() => {});
    }
  }

  pause() {
    for (const worker of this.workers) {
      worker.stop();
    }
  }

  resume(queues = ["default"]) {
    this.workers = [];
    this.start(queues);
  }

  terminate() {
    this.running = false;
    this.pause();
  }
}

export default WorkerSupervisor;
