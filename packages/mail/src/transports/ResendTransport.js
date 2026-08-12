import net from "node:net";
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
    this.host = options.host || process.env.MAIL_HOST || "127.0.0.1";
    this.port = Number(options.port || process.env.MAIL_PORT || 2525);
    this.username = options.username || process.env.MAIL_USERNAME || null;
    this.password = options.password || process.env.MAIL_PASSWORD || null;
    this.encryption = options.encryption || options.secure || process.env.MAIL_ENCRYPTION || null;
  }

  name() {
    return "smtp";
  }

  async send(mailMessage) {
    if (process.env.NODE_ENV === "test") {
      return {
        success: true,
        messageId: `smtp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        host: this.host,
        port: this.port,
      };
    }

    return new Promise((resolve, reject) => {
      let socket = null;
      let buffer = "";

      const cleanup = () => {
        if (socket) {
          socket.removeAllListeners();
          socket.destroy();
          socket = null;
        }
      };

      try {
        socket = net.connect({ host: this.host, port: this.port });
      } catch (err) {
        return reject(new TransportException("smtp", err.message));
      }

      const sendCmd = (cmd) => {
        if (socket) socket.write(cmd + "\r\n");
      };

      let step = "GREETING";

      // MailMessage nests data under .envelope and .content — normalise here
      const env = (mailMessage.envelope && typeof mailMessage.envelope === "object")
        ? mailMessage.envelope
        : mailMessage;
      const cnt = (mailMessage.content && typeof mailMessage.content === "object")
        ? mailMessage.content
        : mailMessage;

      const fromAddr = env.from || process.env.MAIL_FROM_ADDRESS || "hello@ecfapp.com";
      const toList   = Array.isArray(env.to) ? env.to : (env.to ? [env.to] : []);
      const subject  = env.subject || "No Subject";
      const bodyHtml = cnt.html || cnt.body || cnt.text || "";

      const handleResponse = (code, lines) => {
        try {
          if (step === "GREETING") {
            if (code !== 220) throw new Error(`SMTP Greeting failed: ${lines}`);
            step = "EHLO";
            sendCmd("EHLO localhost");
          } else if (step === "EHLO") {
            if (code !== 250) throw new Error(`SMTP EHLO failed: ${lines}`);
            if (this.username && this.password) {
              step = "AUTH_LOGIN";
              sendCmd("AUTH LOGIN");
            } else {
              step = "MAIL_FROM";
              sendCmd(`MAIL FROM:<${fromAddr}>`);
            }
          } else if (step === "AUTH_LOGIN") {
            if (code !== 334) throw new Error(`SMTP AUTH LOGIN failed: ${lines}`);
            step = "AUTH_USER";
            sendCmd(Buffer.from(this.username).toString("base64"));
          } else if (step === "AUTH_USER") {
            if (code !== 334) throw new Error(`SMTP Username failed: ${lines}`);
            step = "AUTH_PASS";
            sendCmd(Buffer.from(this.password).toString("base64"));
          } else if (step === "AUTH_PASS") {
            if (code !== 235) throw new Error(`SMTP Authentication failed: ${lines}`);
            step = "MAIL_FROM";
            sendCmd(`MAIL FROM:<${fromAddr}>`);
          } else if (step === "MAIL_FROM") {
            if (code !== 250) throw new Error(`SMTP MAIL FROM failed: ${lines}`);
            step = "RCPT_TO";
            sendCmd(`RCPT TO:<${toList[0]}>`);
          } else if (step === "RCPT_TO") {
            if (code !== 250 && code !== 251) throw new Error(`SMTP RCPT TO failed: ${lines}`);
            step = "DATA";
            sendCmd("DATA");
          } else if (step === "DATA") {
            if (code !== 354) throw new Error(`SMTP DATA failed: ${lines}`);
            step = "BODY";
            const rawEmail = [
              `From: ${fromAddr}`,
              `To: ${toList.join(", ")}`,
              `Subject: ${subject}`,
              "MIME-Version: 1.0",
              "Content-Type: text/html; charset=utf-8",
              "",
              bodyHtml,
              "\r\n."
            ].join("\r\n");
            sendCmd(rawEmail);
          } else if (step === "BODY") {
            if (code !== 250) throw new Error(`SMTP Send DATA failed: ${lines}`);
            step = "QUIT";
            sendCmd("QUIT");
            cleanup();
            resolve({
              success: true,
              messageId: `smtp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              host: this.host,
              port: this.port,
            });
          }
        } catch (err) {
          cleanup();
          reject(new TransportException("smtp", err.message));
        }
      };

      socket.on("data", (data) => {
        buffer += data.toString("utf8");
        while (buffer.includes("\r\n")) {
          const idx = buffer.indexOf("\r\n");
          const line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          const codeStr = line.slice(0, 3);
          const code = parseInt(codeStr, 10);
          if (!isNaN(code) && (line.length === 3 || line[3] === " ")) {
            handleResponse(code, line);
          }
        }
      });

      socket.on("error", (err) => {
        cleanup();
        reject(new TransportException("smtp", err.message));
      });

      socket.setTimeout(10000, () => {
        cleanup();
        reject(new TransportException("smtp", "Connection timed out connecting to SMTP server"));
      });
    });
  }
}

export default ResendTransport;
