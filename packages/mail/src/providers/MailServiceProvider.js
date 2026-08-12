import { ServiceProvider } from "@ecfjs/core";
import MailManager from "../internal/MailManager.js";
import { SmtpTransport } from "../transports/ResendTransport.js";

export class MailServiceProvider extends ServiceProvider {
  register(app) {
    app.singleton("mail", (app) => new MailManager(app));
  }

  boot(app) {
    // Resolve the MailManager
    const manager = app.make("mail");

    // Read the mail config (loaded via app.configure({ mail: mailConfig }))
    let cfg = {};
    try {
      const configManager = app.make("config");
      if (configManager && typeof configManager.get === "function") {
        cfg = configManager.get("mail") || {};
      }
    } catch {
      // config not available — fall back to env vars
    }

    // Set the default mailer (e.g. "smtp", "log", "memory") from config or env
    const defaultMailer = cfg.default || process.env.MAIL_MAILER || "log";
    manager.defaultMailer = defaultMailer;

    // Pre-warm the SMTP transport with credentials from config / env
    if (defaultMailer === "smtp") {
      const smtpCfg = (cfg.mailers && cfg.mailers.smtp) ? cfg.mailers.smtp : {};
      manager.mailers.set("smtp", new SmtpTransport({
        host:       smtpCfg.host       || process.env.MAIL_HOST       || "127.0.0.1",
        port:       smtpCfg.port       || process.env.MAIL_PORT       || 2525,
        username:   smtpCfg.username   || process.env.MAIL_USERNAME   || null,
        password:   smtpCfg.password   || process.env.MAIL_PASSWORD   || null,
        encryption: smtpCfg.encryption || process.env.MAIL_ENCRYPTION || null,
      }));
    }
  }
}

export default MailServiceProvider;
