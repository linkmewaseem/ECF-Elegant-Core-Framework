import IMailManager from "../contracts/IMailManager.js";
import MemoryTransport from "../transports/MemoryTransport.js";
import LogTransport, { NullTransport } from "../transports/LogTransport.js";
import ResendTransport, { SmtpTransport } from "../transports/ResendTransport.js";
import MailTestingFake from "../testing/MailTestingFake.js";
import MailMessage from "./MailMessage.js";

export class MailManager extends IMailManager {
  constructor(app = null) {
    super();
    this.app = app;
    this.mailers = new Map();
    this.defaultMailer = "memory";
    this.fakeHarness = null;
  }

  mailer(name = null) {
    const mailerName = name || this.defaultMailer;
    if (this.fakeHarness) {
      return this.fakeHarness;
    }
    if (!this.mailers.has(mailerName)) {
      this.mailers.set(mailerName, this.resolve(mailerName));
    }
    return this.mailers.get(mailerName);
  }

  resolve(name) {
    if (name === "memory") return new MemoryTransport();
    if (name === "log") return new LogTransport();
    if (name === "null") return new NullTransport();
    if (name === "smtp") return new SmtpTransport();
    if (name === "resend") return new ResendTransport();
    throw new Error(`Mailer transport '${name}' is not configured.`);
  }

  to(recipients) {
    if (this.fakeHarness) {
      return this.fakeHarness.to(recipients);
    }

    const transport = this.mailer();
    return {
      send: async (mailable) => {
        mailable.to(recipients);

        const envelope = mailable.envelope();
        const content = mailable.content();
        const attachments = mailable.attachments();

        const message = new MailMessage({ envelope, content, attachments });
        return transport.send(message);
      },
      queue: async (mailable, queueName) => {
        mailable.to(recipients);
        return mailable.queue(queueName);
      }
    };
  }

  async send(mailable) {
    return this.to(mailable.envelope().to).send(mailable);
  }

  fake() {
    this.fakeHarness = new MailTestingFake();
    return this.fakeHarness;
  }
}

export default MailManager;
