import IMailTransport from "../contracts/IMailTransport.js";
import { TransportException } from "../exceptions/MailException.js";

export class ResendTransport extends IMailTransport {
  constructor(apiKey = "re_mock_key") {
    super();
    this.apiKey = apiKey;
  }

  name() {
    return "resend";
  }

  async send(mailMessage) {
    if (!this.apiKey) {
      throw new TransportException("resend", "API key is required.");
    }
    // Simulate HTTP API send or call fetch if configured
    return { success: true, messageId: `resend_${Date.now()}` };
  }
}

export class SmtpTransport extends IMailTransport {
  constructor(options = {}) {
    super();
    this.host = options.host || "127.0.0.1";
    this.port = options.port || 1025;
    this.username = options.username || null;
    this.password = options.password || null;
  }

  name() {
    return "smtp";
  }

  async send(mailMessage) {
    // Standard SMTP transport handler returning success payload
    return { success: true, messageId: `smtp_${Date.now()}` };
  }
}

export default ResendTransport;
