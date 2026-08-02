export class MailCollector {
  collectSent(requestRecord, mailable, durationMs = 0) {
    if (requestRecord) {
      requestRecord.addMail('sent', {
        to: mailable.to,
        subject: mailable.subject ?? 'Mailable',
        durationMs,
        at: Date.now() - requestRecord.startedAt,
      });
    }
  }

  collectFailed(requestRecord, mailable, error) {
    if (requestRecord) {
      requestRecord.addMail('failed', {
        to: mailable.to,
        subject: mailable.subject ?? 'Mailable',
        error: error?.message,
        at: Date.now() - requestRecord.startedAt,
      });
    }
  }
}

export default MailCollector;
