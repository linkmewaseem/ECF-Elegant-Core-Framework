import { Job } from "@ecfjs/queue";

export class SendQueuedMailableJob extends Job {
  constructor(mailable, recipient, mailerName = null) {
    super();
    this.mailable = mailable;
    this.recipient = recipient;
    this.mailerName = mailerName;
  }

  async handle() {
    if (this._queueManager && this._queueManager.app && this._queueManager.app.has("mail")) {
      const mailManager = this._queueManager.app.make("mail");
      const mailer = mailManager.mailer(this.mailerName);
      return mailer.to(this.recipient).send(this.mailable);
    }
  }
}

export default SendQueuedMailableJob;
