export class MailSandboxServer {
  constructor(memoryTransport) {
    this.memoryTransport = memoryTransport;
  }

  getCapturedEmails() {
    return this.memoryTransport.messages || [];
  }

  renderPreviewHtml(index = 0) {
    const emails = this.getCapturedEmails();
    if (emails.length === 0 || !emails[index]) {
      return `<html><body><h3>No captured emails in sandbox preview.</h3></body></html>`;
    }

    const email = emails[index];
    const htmlBody = email.content.html || `<p>${email.content.text || email.content.markdown || ""}</p>`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ECF Mail Sandbox Preview</title>
        <style>
          body { font-family: monospace; background: #18181b; color: #f4f4f5; margin: 0; padding: 20px; }
          .card { background: #27272a; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .preview-frame { background: #ffffff; color: #000; padding: 20px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Subject: ${email.envelope.subject}</h2>
          <p><strong>From:</strong> ${email.envelope.from || "default"}</p>
          <p><strong>To:</strong> ${email.envelope.to.join(", ")}</p>
        </div>
        <div class="preview-frame">
          ${htmlBody}
        </div>
      </body>
      </html>
    `;
  }
}

export default MailSandboxServer;
