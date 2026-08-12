import Envelope from "../mailable/Envelope.js";
import Content from "../mailable/Content.js";

export class MailMessage {
  constructor(data = {}) {
    // If already constructed instances, use them directly — do NOT re-wrap.
    // Re-wrapping with new Envelope(existingEnvelope) copies field-by-field and
    // can silently drop fields like `to` if the copy reads stale data.
    this.envelope = (data.envelope instanceof Envelope)
      ? data.envelope
      : new Envelope(data.envelope || {});
    this.content = (data.content instanceof Content)
      ? data.content
      : new Content(data.content || {});
    this.attachments = data.attachments || [];
    this.sentAt = data.sentAt ? new Date(data.sentAt) : new Date();
  }
}

export default MailMessage;
