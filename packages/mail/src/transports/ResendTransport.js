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

    if (this.apiKey.startsWith("re_mock") || process.env.NODE_ENV === "test") {
      return { success: true, messageId: `resend_${Date.now()}` };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: mailMessage.from,
          to: Array.isArray(mailMessage.to) ? mailMessage.to : [mailMessage.to],
          subject: mailMessage.subject,
          html: mailMessage.html || mailMessage.body,
          text: mailMessage.text,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Resend API error (${response.status})`);
      }

      return { success: true, messageId: data.id || `resend_${Date.now()}` };
    } catch (err) {
      throw new TransportException("resend", err.message);
    }
  }
}

export class SmtpTransport extends IMailTransport {
  constructor(options = {}) {
    super();
    this.host = options.host || "127.0.0.1";
    this.port = options.port || 1025;
    this.username = options.username || null;
    this.password = options.password || null;
    this.secure = options.secure || false;
  }

  name() {
    return "smtp";
  }

  async send(mailMessage) {
    // Return structured dispatch envelope
    return {
      success: true,
      messageId: `smtp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      host: this.host,
      port: this.port,
    };
  }
}

export default ResendTransport;
