import IBroadcastMiddleware from "../../contracts/IBroadcastMiddleware.js";

export class AuditMiddleware extends IBroadcastMiddleware {
  constructor(auditLog = []) {
    super();
    this.auditLog = auditLog;
  }

  async handle(message, next) {
    this.auditLog.push({
      id: message.id,
      event: message.event,
      channel: message.channel,
      timestamp: Date.now(),
    });
    return await next(message);
  }
}

export default AuditMiddleware;
