import ShouldBroadcastNow from "../contracts/ShouldBroadcastNow.js";
import BroadcastEventJob from "../jobs/BroadcastEventJob.js";

export class BroadcastEventSubscriber {
  constructor(broadcastManager, queueManager = null) {
    this.broadcastManager = broadcastManager;
    this.queueManager = queueManager;
  }

  async handleEvent(eventInstance) {
    if (!eventInstance || typeof eventInstance.broadcastOn !== "function") {
      return;
    }

    const isSync = eventInstance instanceof ShouldBroadcastNow || eventInstance.shouldBroadcastNow === true;

    if (!isSync && this.queueManager) {
      const job = new BroadcastEventJob(this.broadcastManager, eventInstance);
      await this.queueManager.push(job);
    } else {
      const job = new BroadcastEventJob(this.broadcastManager, eventInstance);
      await job.handle();
    }
  }

  subscribe(eventDispatcher) {
    if (!eventDispatcher) return;
    const target = eventDispatcher.dispatcher || eventDispatcher;
    if (typeof target.use === "function") {
      target.use(async (context, next) => {
        await next();
        if (context && context.eventInstance) {
          await this.handleEvent(context.eventInstance);
        }
      });
    }
  }
}

export default BroadcastEventSubscriber;
