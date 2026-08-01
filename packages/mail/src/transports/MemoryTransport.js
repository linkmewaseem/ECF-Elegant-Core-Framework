import IMailTransport from "../contracts/IMailTransport.js";

export class MemoryTransport extends IMailTransport {
  constructor() {
    super();
    this.messages = [];
  }

  name() {
    return "memory";
  }

  async send(mailMessage) {
    this.messages.push(mailMessage);
    return { success: true, messageId: `mem_${Date.now()}_${this.messages.length}` };
  }

  flush() {
    this.messages = [];
  }
}

export class ArrayTransport extends MemoryTransport {
  name() {
    return "array";
  }
}

export default MemoryTransport;
