import Envelope from "../mailable/Envelope.js";
import Content from "../mailable/Content.js";

export class MailMessage {
  constructor(data = {}) {
    this.envelope = data.envelope ? new Envelope(data.envelope) : new Envelope();
    this.content = data.content ? new Content(data.content) : new Content();
    this.attachments = data.attachments || [];
    this.sentAt = data.sentAt ? new Date(data.sentAt) : new Date();
  }
}

export default MailMessage;
