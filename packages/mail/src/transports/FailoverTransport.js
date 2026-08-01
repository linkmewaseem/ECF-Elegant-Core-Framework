import IMailTransport from "../contracts/IMailTransport.js";
import { TransportException } from "../exceptions/MailException.js";

export class FailoverTransport extends IMailTransport {
  constructor(transports = []) {
    super();
    this.transports = transports;
  }

  name() {
    return "failover";
  }

  async send(mailMessage) {
    let lastErr = null;
    for (const transport of this.transports) {
      try {
        return await transport.send(mailMessage);
      } catch (err) {
        lastErr = err;
      }
    }
    throw new TransportException("failover", `All failover transports failed: ${lastErr?.message}`);
  }
}

export class LoadBalancedTransport extends IMailTransport {
  constructor(transports = []) {
    super();
    this.transports = transports;
    this.currentIndex = 0;
  }

  name() {
    return "loadbalancer";
  }

  async send(mailMessage) {
    if (this.transports.length === 0) {
      throw new TransportException("loadbalancer", "No transports configured in pool.");
    }
    const transport = this.transports[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.transports.length;
    return transport.send(mailMessage);
  }
}

export default FailoverTransport;
