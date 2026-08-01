import IMailable from "../contracts/IMailable.js";
import Envelope from "./Envelope.js";
import Content from "./Content.js";
import SendQueuedMailableJob from "./SendQueuedMailableJob.js";

export class Mailable extends IMailable {
  constructor() {
    super();
    this._envelope = new Envelope();
    this._content = new Content();
    this._attachments = [];
    this._mailer = null;
  }

  to(recipients) {
    this._envelope.to = Array.isArray(recipients) ? recipients : [recipients];
    return this;
  }

  cc(recipients) {
    this._envelope.cc = Array.isArray(recipients) ? recipients : [recipients];
    return this;
  }

  bcc(recipients) {
    this._envelope.bcc = Array.isArray(recipients) ? recipients : [recipients];
    return this;
  }

  subject(subj) {
    this._envelope.subject = subj;
    return this;
  }

  from(sender) {
    this._envelope.from = sender;
    return this;
  }

  view(viewName, data = {}) {
    this._content.view = viewName;
    this._content.data = data;
    return this;
  }

  html(htmlString) {
    this._content.html = htmlString;
    return this;
  }

  markdown(viewName, data = {}) {
    this._content.markdown = viewName;
    this._content.data = data;
    return this;
  }

  attach(attachment) {
    this._attachments.push(attachment);
    return this;
  }

  envelope() {
    return this._envelope;
  }

  content() {
    return this._content;
  }

  attachments() {
    return this._attachments;
  }

  async queue(queueName = "emails") {
    const job = new SendQueuedMailableJob(this, this._envelope.to[0]);
    job.onQueue(queueName);
    return job.constructor.dispatch(this, this._envelope.to[0]);
  }

  async later(delayInSeconds, queueName = "emails") {
    const job = new SendQueuedMailableJob(this, this._envelope.to[0]);
    job.onQueue(queueName).delay(delayInSeconds);
    return job.constructor.dispatch(this, this._envelope.to[0]);
  }
}

export default Mailable;
