import IMailManager from "../contracts/IMailManager.js";
import MemoryTransport from "../transports/MemoryTransport.js";
import LogTransport, { NullTransport } from "../transports/LogTransport.js";
import ResendTransport, { SmtpTransport } from "../transports/ResendTransport.js";
import MailTestingFake from "../testing/MailTestingFake.js";
import MailMessage from "./MailMessage.js";
import Mailable from "../mailable/Mailable.js";

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
    if (name === "smtp") {
      const smtpConfig = (this.app && typeof this.app.make === "function") 
        ? (this.app.make("config")?.get("mail.mailers.smtp") || {}) 
        : {};
      return new SmtpTransport(smtpConfig);
    }
    if (name === "resend") return new ResendTransport();
    throw new Error(`Mailer transport '${name}' is not configured.`);
  }

  to(recipients) {
    if (this.fakeHarness) {
      return this.fakeHarness.to(recipients);
    }

    const transport = this.mailer();
    return {
      send: async (mailable, data = {}) => {
        let instance = mailable;

        if (typeof mailable === "function") {
          try {
            instance = new mailable(data);
          } catch {
            instance = new Mailable();
          }
        } else if (typeof mailable === "string") {
          instance = new Mailable();
          instance.view(mailable, data);
        } else if (mailable && typeof mailable.to !== "function") {
          instance = new Mailable();
          if (mailable.subject) instance.subject(mailable.subject);
          if (mailable.from) instance.from(mailable.from);
          if (mailable.html) instance.html(mailable.html);
          if (mailable.view) instance.view(mailable.view, mailable.data || data);
          if (mailable.markdown) instance.markdown(mailable.markdown, mailable.data || data);
        }

        if (instance && typeof instance.to === "function") {
          instance.to(recipients);
        }

        const envelope = instance.envelope ? instance.envelope() : { to: Array.isArray(recipients) ? recipients : [recipients] };
        const content = instance.content ? instance.content() : {};
        const attachments = instance.attachments ? instance.attachments() : [];

        const message = new MailMessage({ envelope, content, attachments });
        const startTime = Date.now();

        const getEvents = () => {
          if (this.app && typeof this.app.make === "function" && this.app.has("events")) {
            return this.app.make("events");
          }
          const app = globalThis.__ECF_APP__;
          if (app && typeof app.make === "function" && app.has("events")) {
            return app.make("events");
          }
          return null;
        };

        try {
          const res = await transport.send(message);
          const events = getEvents();
          if (events) {
            try {
              events.dispatch("MailSent", {
                to: envelope.to || recipients,
                subject: envelope.subject || content.subject || instance.subjectStr || mailable.subject || "Mailable",
                durationMs: Date.now() - startTime
              });
            } catch {}
          }
          return res;
        } catch (err) {
          const events = getEvents();
          if (events) {
            try {
              events.dispatch("MailFailed", {
                to: envelope.to || recipients,
                subject: envelope.subject || content.subject || instance.subjectStr || mailable.subject || "Mailable",
                error: err
              });
            } catch {}
          }
          throw err;
        }
      },
      queue: async (mailable, queueName) => {
        let instance = mailable;
        if (typeof instance === "string") {
          instance = new Mailable();
          instance.view(mailable);
        }
        if (instance && typeof instance.to === "function") {
          instance.to(recipients);
        }
        return instance.queue(queueName);
      }
    };
  }

  async send(mailable) {
    const toRecipients = (mailable && typeof mailable.envelope === "function" && mailable.envelope().to) ? mailable.envelope().to : [];
    return this.to(toRecipients).send(mailable);
  }

  fake() {
    this.fakeHarness = new MailTestingFake();
    return this.fakeHarness;
  }
}

export default MailManager;
