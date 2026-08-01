export class Envelope {
  constructor(data = {}) {
    this.from = data.from || null;
    this.to = Array.isArray(data.to) ? data.to : (data.to ? [data.to] : []);
    this.cc = Array.isArray(data.cc) ? data.cc : (data.cc ? [data.cc] : []);
    this.bcc = Array.isArray(data.bcc) ? data.bcc : (data.bcc ? [data.bcc] : []);
    this.replyTo = data.replyTo || null;
    this.subject = data.subject || "No Subject";
    this.tags = data.tags || [];
    this.metadata = data.metadata || {};
  }
}

export default Envelope;
