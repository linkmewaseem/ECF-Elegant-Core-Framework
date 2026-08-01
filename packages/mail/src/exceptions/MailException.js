export class MailException extends Error {
  constructor(message = "Mail exception.", status = 500, code = "ERR_MAIL") {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}

export class TransportException extends MailException {
  constructor(transportName, reason) {
    super(`Mail transport '${transportName}' failed: ${reason}`, 500, "ERR_MAIL_TRANSPORT");
    this.transportName = transportName;
  }
}

export class MailValidationException extends MailException {
  constructor(reason = "Recipient or envelope validation failed.") {
    super(`Mail validation error: ${reason}`, 422, "ERR_MAIL_VALIDATION");
  }
}

export default MailException;
