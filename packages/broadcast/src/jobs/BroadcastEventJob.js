export class BroadcastEventJob {
  constructor(broadcastManager, eventInstance) {
    this.broadcastManager = broadcastManager;
    this.eventInstance = eventInstance;
  }

  async handle() {
    if (!this.broadcastManager || !this.eventInstance) return;

    let channels = [];
    if (typeof this.eventInstance.broadcastOn === "function") {
      channels = this.eventInstance.broadcastOn();
    }
    if (!Array.isArray(channels)) {
      channels = [channels];
    }

    let eventName = this.eventInstance.constructor.name;
    if (typeof this.eventInstance.broadcastAs === "function" && this.eventInstance.broadcastAs()) {
      eventName = this.eventInstance.broadcastAs();
    }

    let payload = {};
    if (typeof this.eventInstance.broadcastWith === "function" && this.eventInstance.broadcastWith()) {
      payload = this.eventInstance.broadcastWith();
    } else {
      const { ...props } = this.eventInstance;
      payload = props;
    }

    for (const channel of channels) {
      await this.broadcastManager.to(channel).emit(eventName, payload, { queued: true });
    }
  }
}

export default BroadcastEventJob;
