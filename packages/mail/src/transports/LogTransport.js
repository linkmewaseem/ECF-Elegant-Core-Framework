import IMailTransport from "../contracts/IMailTransport.js";

export class LogTransport extends IMailTransport {
  constructor(logger = console) {
    super();
    this.logger = logger;
  }

  name() {
    return "log";
  }

  async send(mailMessage) {
    const to = mailMessage.envelope.to.join(", ");
    const subject = mailMessage.envelope.subject;
    this.logger.log(`[Mail LogTransport] Sent to: ${to} | Subject: ${subject}`);
    return { success: true, messageId: `log_${Date.now()}` };
  }
}

export class NullTransport extends IMailTransport {
  name() {
    return "null";
  }

  async send() {
    return { success: true, messageId: `null_${Date.now()}` };
  }
}

export default LogTransport;
