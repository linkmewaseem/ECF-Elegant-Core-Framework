import { BaseDriver } from './BaseDriver.js';

/**
 * Mail Driver — sends log alerts via @ecfjs/mail if available.
 */
export class MailDriver extends BaseDriver {
  constructor(options = {}) {
    super(options);
    this.mailer = options.mailer || null; // IMailManager instance
    this.to = options.to || process.env.LOG_ALERT_EMAIL || 'admin@example.com';
    this.subject = options.subject || 'ECF Log Alert';
  }

  async write(record) {
    if (!this.mailer || typeof this.mailer.send !== 'function') {
      return;
    }

    const levelStr = String(record?.level || 'error').toUpperCase();
    const bodyStr = typeof record === 'string' ? record : JSON.stringify(record, null, 2);

    await this.mailer.to(this.to).send({
      subject: `[${levelStr}] ${this.subject}`,
      text: bodyStr,
      html: `<pre>${bodyStr}</pre>`,
    });
  }

  getCapabilities() {
    return {
      supportsJson: true,
      supportsBatch: false,
      supportsRetry: true,
      supportsRotation: false,
      supportsCompression: false,
      supportsArchive: false,
    };
  }
}

export default MailDriver;
