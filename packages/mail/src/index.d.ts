export class Envelope {
  from: string | null;
  to: string[];
  cc: string[];
  bcc: string[];
  replyTo: string | null;
  subject: string;
  tags: string[];
  metadata: any;
}

export class Content {
  view: string | null;
  html: string | null;
  text: string | null;
  markdown: string | null;
  data: any;
}

export class Mailable {
  to(recipients: string | string[]): this;
  cc(recipients: string | string[]): this;
  bcc(recipients: string | string[]): this;
  subject(subj: string): this;
  from(sender: string): this;
  view(viewName: string, data?: any): this;
  html(htmlString: string): this;
  markdown(viewName: string, data?: any): this;
  attach(attachment: any): this;
  envelope(): Envelope;
  content(): Content;
  attachments(): any[];
  queue(queueName?: string): Promise<any>;
  later(delayInSeconds: number, queueName?: string): Promise<any>;
}

export class MailException extends Error {
  status: number;
  code: string;
}
export class TransportException extends MailException {}
export class MailValidationException extends MailException {}

export class MemoryTransport {}
export class SmtpTransport {}
export class ResendTransport {}
export class FailoverTransport {}
export class LoadBalancedTransport {}

export class Attachment {
  static fromPath(filePath: string, name?: string, mime?: string): Attachment;
  static fromBuffer(buffer: Buffer, name?: string, mime?: string): Attachment;
  static fromStorage(storageManager: any, pathOnDisk: string, disk?: string, name?: string): Promise<Attachment>;
}

export class MailTestingFake {
  to(recipient: string): this;
  send(mailable: Mailable): Promise<any>;
  queue(mailable: Mailable): Promise<any>;
  assertSent(mailableClass: any): void;
  assertQueued(mailableClass: any): void;
  assertNothingSent(): void;
  assertSentTo(recipient: string, mailableClass: any): void;
}

export class MailServiceProvider {
  register(app: any): void;
  boot(app: any): void;
}

export const Mail: any;
