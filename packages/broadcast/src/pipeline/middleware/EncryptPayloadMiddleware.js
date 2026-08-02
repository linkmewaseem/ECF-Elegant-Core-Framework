import IBroadcastMiddleware from "../../contracts/IBroadcastMiddleware.js";
import PayloadEncryptor from "../../encryption/PayloadEncryptor.js";

export class EncryptPayloadMiddleware extends IBroadcastMiddleware {
  constructor(secretKey = "ecf-broadcast-secret") {
    super();
    this.encryptor = new PayloadEncryptor(secretKey);
  }

  async handle(message, next) {
    if (message.channel && (message.channel.startsWith("private-") || message.channel.startsWith("presence-"))) {
      message.payload = this.encryptor.encrypt(message.payload);
      message.headers = message.headers || {};
      message.headers["x-encrypted"] = "aes-256-gcm";
    }
    return await next(message);
  }
}

export default EncryptPayloadMiddleware;
