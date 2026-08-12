export class MailCollector {
  collectSent(requestRecord, mailable, durationMs = 0) {
    if (!requestRecord) return;
    const to = Array.isArray(mailable.to) ? mailable.to.join(', ') : String(mailable.to || '');
    const subject = mailable.subject || 'Mailable';
    const at = Date.now() - (requestRecord.startedAt ?? Date.now());

    const timelineItem = {
      event: `Mail Sent: ${subject} (${to})`,
      category: 'mail',
      at,
      status: 'SUCCESS',
      data: { to, subject, durationMs }
    };

    if (typeof requestRecord.addTimelineEntry === 'function') requestRecord.addTimelineEntry(timelineItem);
    else if (Array.isArray(requestRecord.timeline)) requestRecord.timeline.push(timelineItem);

    if (typeof requestRecord.addMail === 'function') {
      requestRecord.addMail('sent', { to, subject, durationMs, at });
    } else if (requestRecord.panels?.mail) {
      requestRecord.panels.mail.totalMails = (requestRecord.panels.mail.totalMails || 0) + 1;
      requestRecord.panels.mail.sent = requestRecord.panels.mail.sent || [];
      requestRecord.panels.mail.sent.push({ to, subject, durationMs, at });
    }
  }

  collectFailed(requestRecord, mailable, error) {
    if (!requestRecord) return;
    const to = Array.isArray(mailable.to) ? mailable.to.join(', ') : String(mailable.to || '');
    const subject = mailable.subject || 'Mailable';
    const at = Date.now() - (requestRecord.startedAt ?? Date.now());

    const timelineItem = {
      event: `Mail Failed: ${subject} (${to})`,
      category: 'mail',
      at,
      status: 'ERROR',
      data: { to, subject, error: error?.message || error }
    };

    if (typeof requestRecord.addTimelineEntry === 'function') requestRecord.addTimelineEntry(timelineItem);
    else if (Array.isArray(requestRecord.timeline)) requestRecord.timeline.push(timelineItem);

    if (typeof requestRecord.addMail === 'function') {
      requestRecord.addMail('failed', { to, subject, error: error?.message || error, at });
    } else if (requestRecord.panels?.mail) {
      requestRecord.panels.mail.totalMails = (requestRecord.panels.mail.totalMails || 0) + 1;
      requestRecord.panels.mail.failed = requestRecord.panels.mail.failed || [];
      requestRecord.panels.mail.failed.push({ to, subject, error: error?.message || error, at });
    }
  }
}

export default MailCollector;
