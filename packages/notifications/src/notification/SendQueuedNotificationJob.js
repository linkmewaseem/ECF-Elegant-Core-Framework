import { Job } from "@ecfjs/queue";

export class SendQueuedNotificationJob extends Job {
  constructor(notifiable, notification, channels = null) {
    super();
    this.notifiable = notifiable;
    this.notification = notification;
    this.channels = channels;
  }

  async handle() {
    if (this._queueManager && this._queueManager.app && this._queueManager.app.has("notifications")) {
      const manager = this._queueManager.app.make("notifications");
      return manager.sendNow(this.notifiable, this.notification, this.channels);
    }
  }
}

export default SendQueuedNotificationJob;
