import assert from "node:assert/strict";

export class MailTestingFake {
  constructor() {
    this.sentMailables = [];
    this.queuedMailables = [];
  }

  to(recipient) {
    this.currentRecipient = recipient;
    return this;
  }

  async send(mailable) {
    this.sentMailables.push({
      mailable,
      recipient: this.currentRecipient || mailable.envelope().to[0],
      sentAt: new Date()
    });
    return { success: true, messageId: `fake_sent_${Date.now()}` };
  }

  async queue(mailable) {
    this.queuedMailables.push({
      mailable,
      recipient: this.currentRecipient || mailable.envelope().to[0],
      queuedAt: new Date()
    });
    return true;
  }

  assertSent(mailableClass) {
    const className = typeof mailableClass === "string" ? mailableClass : mailableClass.name;
    const found = this.sentMailables.some(m => m.mailable.constructor.name === className);
    assert.ok(found, `Expected mailable '${className}' to be sent, but it was not found.`);
  }

  assertQueued(mailableClass) {
    const className = typeof mailableClass === "string" ? mailableClass : mailableClass.name;
    const found = this.queuedMailables.some(m => m.mailable.constructor.name === className);
    assert.ok(found, `Expected mailable '${className}' to be queued, but it was not found.`);
  }

  assertNothingSent() {
    assert.equal(this.sentMailables.length, 0, `Expected zero sent mailables, but found ${this.sentMailables.length}.`);
  }

  assertSentTo(recipient, mailableClass) {
    const className = typeof mailableClass === "string" ? mailableClass : mailableClass.name;
    const found = this.sentMailables.some(m => m.recipient === recipient && m.mailable.constructor.name === className);
    assert.ok(found, `Expected mailable '${className}' sent to '${recipient}', but it was not found.`);
  }
}

export default MailTestingFake;
