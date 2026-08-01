export class IMailer {
  to(recipients) { throw new Error("Method not implemented."); }
  send(mailable) { throw new Error("Method not implemented."); }
  queue(mailable, queueName) { throw new Error("Method not implemented."); }
  later(delayInSeconds, mailable, queueName) { throw new Error("Method not implemented."); }
}
export default IMailer;
