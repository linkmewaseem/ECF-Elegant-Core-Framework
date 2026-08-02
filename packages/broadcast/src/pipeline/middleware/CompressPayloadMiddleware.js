import IBroadcastMiddleware from "../../contracts/IBroadcastMiddleware.js";

export class CompressPayloadMiddleware extends IBroadcastMiddleware {
  async handle(message, next) {
    if (message.payload && typeof message.payload === "object") {
      message.headers = message.headers || {};
      message.headers["x-compressed"] = "gzip";
    }
    return await next(message);
  }
}

export default CompressPayloadMiddleware;
